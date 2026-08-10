const PLACE_FIELDS =
  "id,displayName,rating,userRatingCount,reviews,googleMapsUri,formattedAddress";

async function getPlace(apiKey, placeId) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId.trim())}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": PLACE_FIELDS,
        "Accept-Language": "en-GB",
      },
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, status: response.status, details };
  }

  return { ok: true, place: await response.json() };
}

async function findQuincyFadez(apiKey) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri",
      "Accept-Language": "en-GB",
    },
    body: JSON.stringify({
      textQuery: "QuincyFadez barber Oxford OX4 2YD",
      locationBias: {
        circle: {
          center: { latitude: 51.7402247, longitude: -1.2202434 },
          radius: 1500,
        },
      },
      maxResultCount: 5,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, status: response.status, details };
  }

  const data = await response.json();
  const places = data.places || [];
  const match =
    places.find((place) =>
      (place.displayName?.text || "").toLowerCase().includes("quincyfadez")
    ) || places[0];

  if (!match?.id) {
    return { ok: false, status: 404, details: "No QuincyFadez place found." };
  }

  return { ok: true, placeId: match.id, match };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const configuredPlaceId = process.env.GOOGLE_PLACE_ID?.trim();

  if (!apiKey) {
    return res.status(503).json({
      error: "Google reviews are not configured yet.",
      code: "GOOGLE_REVIEWS_NOT_CONFIGURED",
    });
  }

  try {
    let placeResult = configuredPlaceId
      ? await getPlace(apiKey, configuredPlaceId)
      : { ok: false, status: 404, details: "No configured Place ID." };

    // The address Place ID can differ from the Google Business Profile Place ID.
    // If the configured ID does not resolve, find the QuincyFadez business listing directly.
    if (!placeResult.ok) {
      console.warn(
        "Configured Google Place ID did not resolve; searching for QuincyFadez business listing.",
        placeResult.status,
        placeResult.details
      );

      const searchResult = await findQuincyFadez(apiKey);
      if (!searchResult.ok) {
        console.error(
          "Google Places text search error",
          searchResult.status,
          searchResult.details
        );
        return res.status(502).json({ error: "Unable to load Google reviews." });
      }

      placeResult = await getPlace(apiKey, searchResult.placeId);
    }

    if (!placeResult.ok) {
      console.error("Google Places error", placeResult.status, placeResult.details);
      return res.status(502).json({ error: "Unable to load Google reviews." });
    }

    const place = placeResult.place;
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

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      placeId: place.id || null,
      name: place.displayName?.text || "QuincyFadez",
      address: place.formattedAddress || null,
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
