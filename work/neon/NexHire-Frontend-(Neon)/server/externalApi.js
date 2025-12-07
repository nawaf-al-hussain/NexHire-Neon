/**
 * External API Integration Layer
 *
 * Replaces 3 SQL Server CLR functions that PostgreSQL doesn't support:
 *   1. CallRESTApi      → callRestApi()     — generic HTTP client
 *   2. GeocodeAddress    → geocodeAddress()  — address → lat/lng via Nominatim (free, no API key)
 *   3. VerifyLinkedInProfile → verifyLinkedInProfile() — URL validation + optional API verification
 *
 * Architecture note: Making HTTP calls from inside the database (SQL Server CLR)
 * was an anti-pattern. The Node.js app layer is the correct place for external
 * API calls — better performance, error handling, timeout control, and security.
 */

const axios = require('axios');
const { URL } = require('url');

// ─────────────────────────────────────────────────────────────────────
// 1. CallRESTApi — generic HTTP client
//    Replaces: SQL Server CLR dbo.CallRESTApi(@url, @method, @body, @headers)
// ─────────────────────────────────────────────────────────────────────

/**
 * Makes an HTTP request to an external API.
 *
 * @param {string} url       - The full URL to call
 * @param {string} method    - HTTP method: GET, POST, PUT, PATCH, DELETE
 * @param {string|object} body - Request body (string or object; objects are JSON-stringified)
 * @param {string|object} headers - Headers as JSON string or object
 * @returns {Promise<object>} - { status, data, headers } or { error }
 */
async function callRestApi(url, method = 'GET', body = null, headers = {}) {
    const startTime = Date.now();

    try {
        // Parse headers if passed as JSON string
        let parsedHeaders = headers;
        if (typeof headers === 'string') {
            try {
                parsedHeaders = JSON.parse(headers);
            } catch {
                parsedHeaders = { 'Content-Type': 'application/json' };
            }
        }

        // Ensure Content-Type for body-bearing requests
        if (body && !parsedHeaders['Content-Type'] && !parsedHeaders['content-type']) {
            parsedHeaders['Content-Type'] = 'application/json';
        }

        // Parse body if passed as string
        let parsedBody = body;
        if (typeof body === 'string' && body.length > 0) {
            try {
                parsedBody = JSON.parse(body);
            } catch {
                // Leave as string if not valid JSON
            }
        }

        const config = {
            method: method.toUpperCase(),
            url,
            headers: parsedHeaders,
            timeout: 15000, // 15s timeout (was unlimited in CLR)
            maxRedirects: 3,
            validateStatus: (status) => status < 500, // Don't throw on 4xx
        };

        if (parsedBody && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.data = parsedBody;
        }

        const response = await axios(config);
        const elapsed = Date.now() - startTime;

        return {
            success: true,
            status: response.status,
            data: response.data,
            headers: response.headers,
            elapsedMs: elapsed,
        };
    } catch (err) {
        const elapsed = Date.now() - startTime;
        return {
            success: false,
            error: err.message,
            code: err.code || 'UNKNOWN',
            status: err.response?.status || null,
            data: err.response?.data || null,
            elapsedMs: elapsed,
        };
    }
}

// ─────────────────────────────────────────────────────────────────────
// 2. GeocodeAddress — address → coordinates
//    Replaces: SQL Server CLR dbo.GeocodeAddress(@address, @apiKey)
//    Uses: OpenStreetMap Nominatim API (free, no API key required)
//    Rate limit: 1 request/second (Nominatim usage policy)
// ─────────────────────────────────────────────────────────────────────

const geocodeCache = new Map(); // Simple in-memory cache (TTL: 1 hour)
const GEOCODE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Geocodes an address string to latitude/longitude coordinates.
 * Uses the free OpenStreetMap Nominatim API (no API key needed).
 *
 * @param {string} address - The address to geocode (e.g., "Dhaka, Bangladesh")
 * @param {string} apiKey   - Not used (Nominatim is free). Kept for API compat.
 * @returns {Promise<object>} - { lat, lon, displayName, type, success } or { error }
 */
async function geocodeAddress(address, apiKey = null) {
    if (!address || address.trim().length < 2) {
        return { success: false, error: 'Address is required' };
    }

    const normalizedAddress = address.trim();

    // Check cache
    const cacheKey = normalizedAddress.toLowerCase();
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < GEOCODE_CACHE_TTL) {
        return { ...cached.data, cached: true };
    }

    try {
        const response = await axios({
            method: 'GET',
            url: 'https://nominatim.openstreetmap.org/search',
            params: {
                q: normalizedAddress,
                format: 'json',
                limit: 1,
                addressdetails: 1,
            },
            headers: {
                'User-Agent': 'NexHire/1.0 (recruitment platform)',
            },
            timeout: 10000,
        });

        if (!response.data || response.data.length === 0) {
            return {
                success: false,
                error: 'No results found for this address',
                address: normalizedAddress,
            };
        }

        const result = response.data[0];
        const data = {
            success: true,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            displayName: result.display_name,
            type: result.type,
            address: normalizedAddress,
            components: result.address || {},
        };

        // Cache the result
        geocodeCache.set(cacheKey, { data, timestamp: Date.now() });

        return data;
    } catch (err) {
        return {
            success: false,
            error: err.message,
            address: normalizedAddress,
        };
    }
}

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Geocodes two addresses and returns the distance between them.
 * @param {string} address1 - First address
 * @param {string} address2 - Second address
 * @returns {Promise<object>} - { distance, lat1, lon1, lat2, lon2, success }
 */
async function calculateDistance(address1, address2) {
    const [geo1, geo2] = await Promise.all([
        geocodeAddress(address1),
        geocodeAddress(address2),
    ]);

    if (!geo1.success || !geo2.success) {
        return {
            success: false,
            error: 'Failed to geocode one or both addresses',
            geo1: geo1.success,
            geo2: geo2.success,
        };
    }

    const distance = haversineDistance(geo1.lat, geo1.lon, geo2.lat, geo2.lon);

    return {
        success: true,
        distance: Math.round(distance * 10) / 10, // Round to 0.1 km
        distanceUnit: 'km',
        address1: { lat: geo1.lat, lon: geo1.lon, displayName: geo1.displayName },
        address2: { lat: geo2.lat, lon: geo2.lon, displayName: geo2.displayName },
    };
}

// ─────────────────────────────────────────────────────────────────────
// 3. VerifyLinkedInProfile — LinkedIn profile verification
//    Replaces: SQL Server CLR dbo.VerifyLinkedInProfile(@profileUrl, @accessToken)
//
//    Real LinkedIn verification requires OAuth 2.0 + People API access.
//    This implementation:
//    1. Validates the URL format (must be linkedin.com/in/...)
//    2. Optionally calls LinkedIn's API if LINKEDIN_ACCESS_TOKEN env var is set
//    3. Returns a structured verification result
// ─────────────────────────────────────────────────────────────────────

/**
 * Verifies a LinkedIn profile URL.
 *
 * @param {string} profileUrl   - The LinkedIn profile URL to verify
 * @param {string} accessToken  - Optional LinkedIn OAuth access token. If not
 *                                provided, falls back to env var or URL-only validation.
 * @returns {Promise<object>} - { verified, profileUrl, profileId, method, details }
 */
async function verifyLinkedInProfile(profileUrl, accessToken = null) {
    if (!profileUrl || profileUrl.trim().length === 0) {
        return {
            verified: false,
            method: 'none',
            error: 'Profile URL is required',
        };
    }

    const url = profileUrl.trim();

    // Step 1: Validate URL format
    try {
        const parsed = new URL(url);

        // Check it's actually LinkedIn
        const hostname = parsed.hostname.toLowerCase();
        if (!hostname.includes('linkedin.com')) {
            return {
                verified: false,
                method: 'url_validation',
                error: 'URL is not a LinkedIn profile URL',
                profileUrl: url,
            };
        }

        // Check it's a profile path (/in/username)
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        if (pathParts.length === 0 || pathParts[0] !== 'in') {
            return {
                verified: false,
                method: 'url_validation',
                error: 'URL is not a personal profile (must be linkedin.com/in/...)',
                profileUrl: url,
            };
        }

        const profileId = pathParts[1] || '';

        // Step 2: If we have an access token, try LinkedIn's People API
        const token = accessToken || process.env.LINKEDIN_ACCESS_TOKEN;

        if (token) {
            try {
                // LinkedIn People API: GET /v2/me
                // This verifies the token is valid and returns profile data
                const response = await axios({
                    method: 'GET',
                    url: 'https://api.linkedin.com/v2/me',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Restli-Protocol-Version': '2.0.0',
                    },
                    timeout: 10000,
                    validateStatus: (status) => status < 500,
                });

                if (response.status === 200) {
                    return {
                        verified: true,
                        method: 'linkedin_api',
                        profileUrl: url,
                        profileId,
                        details: {
                            firstName: response.data.firstName?.localized?.en_US || response.data.firstName,
                            lastName: response.data.lastName?.localized?.en_US || response.data.lastName,
                            linkedinId: response.data.id,
                        },
                    };
                } else if (response.status === 401) {
                    return {
                        verified: false,
                        method: 'linkedin_api',
                        profileUrl: url,
                        profileId,
                        error: 'LinkedIn access token is expired or invalid',
                    };
                } else {
                    return {
                        verified: false,
                        method: 'linkedin_api',
                        profileUrl: url,
                        profileId,
                        error: `LinkedIn API returned status ${response.status}`,
                    };
                }
            } catch (apiErr) {
                // API call failed, fall back to URL validation
                return {
                    verified: true,
                    method: 'url_validation',
                    profileUrl: url,
                    profileId,
                    warning: `LinkedIn API call failed: ${apiErr.message}. URL format is valid.`,
                };
            }
        }

        // Step 3: No access token — URL validation only
        // We can do a lightweight HTTP HEAD to check if the profile page exists
        try {
            const headResponse = await axios({
                method: 'HEAD',
                url: url,
                timeout: 8000,
                maxRedirects: 3,
                validateStatus: (status) => status < 500,
            });

            if (headResponse.status === 200) {
                return {
                    verified: true,
                    method: 'url_validation',
                    profileUrl: url,
                    profileId,
                    note: 'URL is valid and accessible. For full verification (name, photo, headline), set LINKEDIN_ACCESS_TOKEN env var.',
                };
            } else if (headResponse.status === 404) {
                return {
                    verified: false,
                    method: 'url_validation',
                    profileUrl: url,
                    profileId,
                    error: 'LinkedIn profile page not found (404)',
                };
            } else {
                return {
                    verified: true,
                    method: 'url_validation',
                    profileUrl: url,
                    profileId,
                    note: `URL format is valid. LinkedIn returned status ${headResponse.status} (may require login to view).`,
                };
            }
        } catch (headErr) {
            // HEAD request failed (LinkedIn may block bots) — still return valid URL format
            return {
                verified: true,
                method: 'url_validation',
                profileUrl: url,
                profileId,
                note: 'URL format is valid. LinkedIn may require login to verify the profile.',
            };
        }
    } catch (urlErr) {
        return {
            verified: false,
            method: 'url_validation',
            error: `Invalid URL: ${urlErr.message}`,
            profileUrl: url,
        };
    }
}

module.exports = {
    callRestApi,
    geocodeAddress,
    calculateDistance,
    haversineDistance,
    verifyLinkedInProfile,
};
