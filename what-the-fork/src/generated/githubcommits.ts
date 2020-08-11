// To parse this data:
//
//   import { Convert } from "./file";
//
//   const githubCommit = Convert.toGithubCommit(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface GithubCommit {
    sha:          string;
    node_id:      string;
    commit:       Commit;
    url:          string;
    html_url:     string;
    comments_url: string;
    author:       GithubCommitAuthor;
    committer:    GithubCommitAuthor;
    parents:      Parent[];
}

export interface GithubCommitAuthor {
    login:               Login;
    id:                  number;
    node_id:             NodeID;
    avatar_url:          string;
    gravatar_id:         string;
    url:                 string;
    html_url:            string;
    followers_url:       string;
    following_url:       string;
    gists_url:           GistsURL;
    starred_url:         string;
    subscriptions_url:   string;
    organizations_url:   string;
    repos_url:           string;
    events_url:          EventsURL;
    received_events_url: string;
    type:                Type;
    site_admin:          boolean;
}

export enum EventsURL {
    HTTPSAPIGithubCOMUsersBachmeiermEventsPrivacy = "https://api.github.com/users/bachmeierm/events{/privacy}",
    HTTPSAPIGithubCOMUsersPmiossecEventsPrivacy = "https://api.github.com/users/pmiossec/events{/privacy}",
    HTTPSAPIGithubCOMUsersRolandPheasantEventsPrivacy = "https://api.github.com/users/RolandPheasant/events{/privacy}",
    HTTPSAPIGithubCOMUsersT0MburtonEventsPrivacy = "https://api.github.com/users/t0mburton/events{/privacy}",
    HTTPSAPIGithubCOMUsersWebFlowEventsPrivacy = "https://api.github.com/users/web-flow/events{/privacy}",
}

export enum GistsURL {
    HTTPSAPIGithubCOMUsersBachmeiermGistsGistID = "https://api.github.com/users/bachmeierm/gists{/gist_id}",
    HTTPSAPIGithubCOMUsersPmiossecGistsGistID = "https://api.github.com/users/pmiossec/gists{/gist_id}",
    HTTPSAPIGithubCOMUsersRolandPheasantGistsGistID = "https://api.github.com/users/RolandPheasant/gists{/gist_id}",
    HTTPSAPIGithubCOMUsersT0MburtonGistsGistID = "https://api.github.com/users/t0mburton/gists{/gist_id}",
    HTTPSAPIGithubCOMUsersWebFlowGistsGistID = "https://api.github.com/users/web-flow/gists{/gist_id}",
}

export enum Login {
    Bachmeierm = "bachmeierm",
    Pmiossec = "pmiossec",
    RolandPheasant = "RolandPheasant",
    T0Mburton = "t0mburton",
    WebFlow = "web-flow",
}

export enum NodeID {
    MDQ6VXNlcjE5ODY0NDQ3 = "MDQ6VXNlcjE5ODY0NDQ3",
    MDQ6VXNlcjQ2MDE5Ng = "MDQ6VXNlcjQ2MDE5Ng==",
    MDQ6VXNlcjU4ODk5NTY = "MDQ6VXNlcjU4ODk5NTY=",
    MDQ6VXNlcjcwMjAwMTk = "MDQ6VXNlcjcwMjAwMTk=",
    MDQ6VXNlcjk4Nzk4NjY = "MDQ6VXNlcjk4Nzk4NjY=",
}

export enum Type {
    User = "User",
}

export interface Commit {
    author:        CommitAuthor;
    committer:     CommitAuthor;
    message:       string;
    tree:          Tree;
    url:           string;
    comment_count: number;
    verification:  Verification;
}

export interface CommitAuthor {
    name:  Name;
    email: Email;
    date:  Date;
}

export enum Email {
    GitBachmeiermOutlookCOM = "git.bachmeierm@outlook.com",
    NoreplyGithubCOM = "noreply@github.com",
    PmiossecGmailCOM = "pmiossec@gmail.com",
    RolandDynamicDataOrg = "roland@dynamic-data.org",
    RolandPheasantHotmailCOM = "roland_pheasant@hotmail.com",
    T0MburtonUsersNoreplyGithubCOM = "t0mburton@users.noreply.github.com",
    TomTburtonCoUk = "tom@tburton.co.uk",
}

export enum Name {
    GitHub = "GitHub",
    MaximilianBachmeier = "Maximilian Bachmeier",
    PhilippeMiossec = "Philippe Miossec",
    RolandPheasant = "Roland Pheasant",
    T0Mburton = "t0mburton",
    TB = "TB",
}

export interface Tree {
    sha: string;
    url: string;
}

export interface Verification {
    verified:  boolean;
    reason:    Reason;
    signature: null | string;
    payload:   null | string;
}

export enum Reason {
    Unsigned = "unsigned",
    Valid = "valid",
}

export interface Parent {
    sha:      string;
    url:      string;
    html_url: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toGithubCommit(json: string): GithubCommit[] {
        return cast(JSON.parse(json), a(r("GithubCommit")));
    }

    public static githubCommitToJson(value: GithubCommit[]): string {
        return JSON.stringify(uncast(value, a(r("GithubCommit"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "GithubCommit": o([
        { json: "sha", js: "sha", typ: "" },
        { json: "node_id", js: "node_id", typ: "" },
        { json: "commit", js: "commit", typ: r("Commit") },
        { json: "url", js: "url", typ: "" },
        { json: "html_url", js: "html_url", typ: "" },
        { json: "comments_url", js: "comments_url", typ: "" },
        { json: "author", js: "author", typ: r("GithubCommitAuthor") },
        { json: "committer", js: "committer", typ: r("GithubCommitAuthor") },
        { json: "parents", js: "parents", typ: a(r("Parent")) },
    ], false),
    "GithubCommitAuthor": o([
        { json: "login", js: "login", typ: r("Login") },
        { json: "id", js: "id", typ: 0 },
        { json: "node_id", js: "node_id", typ: r("NodeID") },
        { json: "avatar_url", js: "avatar_url", typ: "" },
        { json: "gravatar_id", js: "gravatar_id", typ: "" },
        { json: "url", js: "url", typ: "" },
        { json: "html_url", js: "html_url", typ: "" },
        { json: "followers_url", js: "followers_url", typ: "" },
        { json: "following_url", js: "following_url", typ: "" },
        { json: "gists_url", js: "gists_url", typ: r("GistsURL") },
        { json: "starred_url", js: "starred_url", typ: "" },
        { json: "subscriptions_url", js: "subscriptions_url", typ: "" },
        { json: "organizations_url", js: "organizations_url", typ: "" },
        { json: "repos_url", js: "repos_url", typ: "" },
        { json: "events_url", js: "events_url", typ: r("EventsURL") },
        { json: "received_events_url", js: "received_events_url", typ: "" },
        { json: "type", js: "type", typ: r("Type") },
        { json: "site_admin", js: "site_admin", typ: true },
    ], false),
    "Commit": o([
        { json: "author", js: "author", typ: r("CommitAuthor") },
        { json: "committer", js: "committer", typ: r("CommitAuthor") },
        { json: "message", js: "message", typ: "" },
        { json: "tree", js: "tree", typ: r("Tree") },
        { json: "url", js: "url", typ: "" },
        { json: "comment_count", js: "comment_count", typ: 0 },
        { json: "verification", js: "verification", typ: r("Verification") },
    ], false),
    "CommitAuthor": o([
        { json: "name", js: "name", typ: r("Name") },
        { json: "email", js: "email", typ: r("Email") },
        { json: "date", js: "date", typ: Date },
    ], false),
    "Tree": o([
        { json: "sha", js: "sha", typ: "" },
        { json: "url", js: "url", typ: "" },
    ], false),
    "Verification": o([
        { json: "verified", js: "verified", typ: true },
        { json: "reason", js: "reason", typ: r("Reason") },
        { json: "signature", js: "signature", typ: u(null, "") },
        { json: "payload", js: "payload", typ: u(null, "") },
    ], false),
    "Parent": o([
        { json: "sha", js: "sha", typ: "" },
        { json: "url", js: "url", typ: "" },
        { json: "html_url", js: "html_url", typ: "" },
    ], false),
    "EventsURL": [
        "https://api.github.com/users/bachmeierm/events{/privacy}",
        "https://api.github.com/users/pmiossec/events{/privacy}",
        "https://api.github.com/users/RolandPheasant/events{/privacy}",
        "https://api.github.com/users/t0mburton/events{/privacy}",
        "https://api.github.com/users/web-flow/events{/privacy}",
    ],
    "GistsURL": [
        "https://api.github.com/users/bachmeierm/gists{/gist_id}",
        "https://api.github.com/users/pmiossec/gists{/gist_id}",
        "https://api.github.com/users/RolandPheasant/gists{/gist_id}",
        "https://api.github.com/users/t0mburton/gists{/gist_id}",
        "https://api.github.com/users/web-flow/gists{/gist_id}",
    ],
    "Login": [
        "bachmeierm",
        "pmiossec",
        "RolandPheasant",
        "t0mburton",
        "web-flow",
    ],
    "NodeID": [
        "MDQ6VXNlcjE5ODY0NDQ3",
        "MDQ6VXNlcjQ2MDE5Ng==",
        "MDQ6VXNlcjU4ODk5NTY=",
        "MDQ6VXNlcjcwMjAwMTk=",
        "MDQ6VXNlcjk4Nzk4NjY=",
    ],
    "Type": [
        "User",
    ],
    "Email": [
        "git.bachmeierm@outlook.com",
        "noreply@github.com",
        "pmiossec@gmail.com",
        "roland@dynamic-data.org",
        "roland_pheasant@hotmail.com",
        "t0mburton@users.noreply.github.com",
        "tom@tburton.co.uk",
    ],
    "Name": [
        "GitHub",
        "Maximilian Bachmeier",
        "Philippe Miossec",
        "Roland Pheasant",
        "t0mburton",
        "TB",
    ],
    "Reason": [
        "unsigned",
        "valid",
    ],
};
