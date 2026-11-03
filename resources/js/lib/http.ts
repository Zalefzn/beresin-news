function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/** Sends a same-origin request outside of an Inertia visit. Browser only. */
export async function sendRequest(
    url: string,
    method: 'GET' | 'POST',
    body?: FormData,
): Promise<Response> {
    return fetch(url, {
        method,
        ...(method === 'POST' ? { body } : {}),
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
    });
}
