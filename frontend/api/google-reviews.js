export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(503).json({
      error: "Google reviews are not configured yet.",
      code: "GOOGLE_REVIEWS_NOT_CONFIGURED",
    });
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "id,displayName,rating,userRatingCount,reviews,googleMapsUri",
          "Accept-Language": "en-GB",
        },
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Google Places error", response.status, details);
      return res.status(502).json({ error: "Unable to load Google reviews." });
    }

    const place = await response.json();
    const reviews = (place.reviews || []).map((review) => ({
      id: review.name,
      rating: review.rating,
      text: review.text?.text || "",
      originalText: review.originalText?.text || "",
      relativeTime: review.relativePublishTimeDescription || "",
      publishedAt: review.publishTime || null,
      sourceUrl: review.googleMapsUri || place.googleMapsUri || null,
      reportUrl: review.flagContentUri || null,
      author: {
        name: review.authorAttribution?.displayName || "Google reviewer",
        profileUrl: review.authorAttribution?.uri || null,
        photoUrl: review.authorAttribution?.photoUri || null,
      },
    }));

    // Google Maps Platform content is returned live and is intentionally not cached here.
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      name: place.displayName?.text || "QuincyFadez",
      rating: place.rating || null,
      reviewCount: place.userRatingCount || 0,
      googleMapsUrl: place.googleMapsUri || null,
      orderingNotice: "Reviews are supplied by Google Maps and ordered by Google relevance.",
      reviews,
    });
  } catch (error) {
    console.error("Google reviews endpoint error", error);
    return res.status(500).json({ error: "Unable to load Google reviews." });
  }
}
