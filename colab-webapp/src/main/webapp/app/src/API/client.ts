/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

/**
 * A very simple Project
 */
export interface Project {
    "@class": "Project";
    id?: number;
    name: string;
}

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

/**
 * fetch given url
 */
async function get<T>(url: string): Promise<T> {
    return fetch(url, getOptions({method: "GET"})).then(res => {
        if (res.ok) {
            return res.json() as Promise<T>;
        } else {
            throw new Error("Failure");
        }
    });
}

/**
 * POST body to url with given content type.
 */
async function post<T>(
    url: string,
    body: {},
    contentType?: string
): Promise<T> {
    return fetch(
        url,
        getOptions({
            method: "POST",
            body: body,
            contentType: contentType
        })
    ).then(res => {
        if (res.ok) {
            return res.json() as Promise<T>;
        } else {
            throw new Error("Failure");
        }
    });
}

async function put<T>(url: string, body: {}): Promise<T> {
    return fetch(
        url,
        getOptions({
            method: "PUT",
            body: body
        })
    ).then(res => {
        if (res.ok) {
            return res.json() as Promise<T>;
        } else {
            throw new Error("Failure");
        }
    });
}

async function putVoid(url: string, body: {}): Promise<void> {
    return fetch(
        url,
        getOptions({
            method: "PUT",
            body: body
        })
    ).then(res => {
        if (res.ok) {
            return;
        } else {
            throw new Error("Failure");
        }
    });
}

async function patchVoid(url: string, body: {}): Promise<void> {
    return fetch(
        url,
        getOptions({
            method: "PATCH",
            body: body
        })
    ).then(res => {
        if (res.ok) {
            return;
        } else {
            throw new Error("Failure");
        }
    });
}

async function deleteR<T>(url: string, body?: {}): Promise<T> {
    return fetch(
        url,
        getOptions({
            method: "DELETE",
            body: body
        })
    ).then(res => {
        if (res.ok) {
            if (res.bodyUsed) {
                return res.json() as Promise<T>;
            } else {
                return undefined as any;
            }
        } else {
            throw new Error("Failure");
        }
    });
}

export async function getProjects(): Promise<Project[]> {
    return get<Project[]>("/api/projects");
}

export async function getProject(id: number): Promise<Project> {
    return get<Project>("/api/projects/" + id);
}

export async function createProject(project: Project): Promise<number> {
    return post<number>("/api/projects", project);
}

export async function updateProject(project: Project) {
    return putVoid("/api/projects/", project);
}

export async function deleteProject(id: number) {
    return deleteR<number>("/api/projects/" + id);
}
