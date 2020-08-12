import { GithubCommit } from "./generated/githubcommits";
import { GithubRepo } from "./generated/github";


export interface githubMap {
    repo: GithubRepo;
    lastCommit?: GithubCommit;
 }

export interface AppState {
    isLoading: boolean;
    baseUrl?: string;
    base?: GithubRepo;
    forks?: githubMap[];
}

export let DefaultAppState:AppState = {
    isLoading: false
    //,baseUrl: ''
};

export interface Fork {
    url: string;
    commitsAhead?: number;
    commitsBehind?: number;
    LastUpdate?: Date;
    LastUpdateCommitId?:string;

    LastCommit?: GithubCommit;
}