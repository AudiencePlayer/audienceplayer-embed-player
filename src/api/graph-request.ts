export function graphRequest(apiFetchUrl: string, query: string, variables: any, token: string) {
    const authHeader = token ? {Authorization: 'Bearer ' + token} : {};

    return fetch(apiFetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...authHeader,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    }).then(response => response.json());
}
