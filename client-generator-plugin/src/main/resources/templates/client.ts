/**
 * build fetch options
 */
function getOptions({
  method,
  body,
  contentType
}: {
  method?: string;
  body?: {} | string | FormData;
  contentType?: string;
}): RequestInit {
  let headers;
  if (contentType) {
    // do not set multipart/form-data by hand but let the
    // browser do it
    if (contentType != "multipart/form-data") {
      headers = new Headers({
        "content-type": contentType
      });
    }
  } else {
    headers = new Headers({
      "content-type": "application/json"
    });
  }

  return {
    headers: headers,
    method: method || "GET",
    body: body
      ? body instanceof FormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined
  };
}

const sendRequest = async <T>(
  method: string,
  path: string,
  body: string | {} | undefined,
  errorHandler: (error: WithJsonDiscriminator | Error) => void,
  contentType: string
): Promise<T> => {
  const res = await fetch(
    path,
    getOptions({
      method: method,
      body: body,
      contentType: contentType
    })
  );

  if (res.ok) {
    if (res.status != 204) {
      return res.json();
    } else {
      return (new Promise<void>(resolve => resolve()) as unknown) as Promise<T>;
    }
  } else {
    let error;
    try {
      error = await res.json();
    } catch (e) {
      error = new Error("Failure");
    }
    errorHandler(error);
    throw error;
  }
};
