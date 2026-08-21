const ORIGIN = "https://blog.unakotimart.com";

export async function onRequest(context) {

    const request = context.request;
    const incomingUrl = new URL(request.url);

    const targetUrl = new URL(
        incomingUrl.pathname + incomingUrl.search,
        ORIGIN
    );

    const headers = new Headers(request.headers);

    headers.set(
        "Host",
        "blog.unakotimart.com"
    );

    headers.set(
        "X-Forwarded-Host",
        incomingUrl.host
    );

    const originRequest = new Request(
        targetUrl.toString(),
        {
            method: request.method,
            headers: headers,
            body:
                request.method === "GET" ||
                request.method === "HEAD"
                    ? undefined
                    : request.body,
            redirect: "manual"
        }
    );

    let response;

    try {

        response = await fetch(originRequest);

    } catch (error) {

        return new Response(
            "Origin server is unavailable.",
            {
                status: 502,
                headers: {
                    "Content-Type":
                        "text/plain; charset=UTF-8"
                }
            }
        );
    }

    const responseHeaders =
        new Headers(response.headers);

    const location =
        responseHeaders.get("Location");

    if (location) {

        try {

            const redirectUrl =
                new URL(
                    location,
                    ORIGIN
                );

            if (
                redirectUrl.hostname ===
                "blog.unakotimart.com"
            ) {

                redirectUrl.hostname =
                    incomingUrl.hostname;

                redirectUrl.protocol =
                    incomingUrl.protocol;

                responseHeaders.set(
                    "Location",
                    redirectUrl.toString()
                );
            }

        } catch (e) {
            // Keep original Location header.
        }
    }

    return new Response(
        response.body,
        {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        }
    );
}
