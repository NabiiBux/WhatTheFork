export interface AppState {
    isLoading: boolean;
    base?: Fork;
    forks?: Fork[];
}

export let DefaultAppState:AppState = {
    isLoading:false
};

export interface Fork {
    url: string;
    commitsAhead?: number;
    commitsBehind?: number;
    LastUpdate?: Date;
    LastUpdateCommitId?:string;
}