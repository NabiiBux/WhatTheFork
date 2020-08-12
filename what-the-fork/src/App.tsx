import React, { useState } from 'react';
// import logo from './logo.svg';
// import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import { Container } from "react-bootstrap";

import { AppState, DefaultAppState, Fork, githubMap } from './_types';
import { Header } from './header';
//import { BodyPlaceHolder } from './bodyPlaceholder';
import { SearchForm } from './searchForm';
import { GithubRepo } from './generated/github';

import { GithubCommit } from './generated/githubcommits';



var corsProxies = [
  { url: "https://cors-anywhere.herokuapp.com/", encode: false, qs: true },
  { url: "https://yacdn.org/serve/", encode: false, qs: false },
  { url: "https://thingproxy.freeboard.io/fetch/", encode: false, qs: true },
  //{ url: "https://cors-proxy.htmldriven.com/?url=", encode:false, qs:true },
  //{ url: "http://www.whateverorigin.org/get?url=", encode:true },
  //{ url:"http://alloworigin.com/get?url=", encode:false},
  //{ url: "https://api.allorigins.win/get?url=", encode: true, qs:true }

]
var proxyLoop = 0;
const useCorsProxies = false;

async function fetchProxy(url: string): Promise<Response> {
  if(!useCorsProxies) {
    return fetch(url);
  }

  //https://nordicapis.com/10-free-to-use-cors-proxies/
  let proxy = corsProxies[proxyLoop++ % corsProxies.length];
  if (url.indexOf('?') > -1 && !proxy.qs)
    proxy = corsProxies[proxyLoop++ % corsProxies.length];

  var rs = await fetch(proxy.url + (proxy.encode ? encodeURIComponent(url) : url));
  // if(proxy.encode) {
  //   var js = await rs.then(rs => rs.json);
  // }
  return rs;
}

function toShortIso(date?: Date | string) {
  if (!date) {
    return "";
  }
  if (typeof (date) === "string") {
    date = new Date(date);
  }
  // date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); //date.toISOString()
  const year = date.getFullYear();
  let month: string | number = (date.getMonth() + 1);
  let dt: string | number = date.getDate();

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }
  return year + '-' + month + '-' + dt;
}

async function GetCommits(branchUrl: string, baseBranches: githubBranch[], date: Date, repo: GithubRepo, newKvp: githubMap) {

  var branches: githubBranch[] = await fetchProxy(branchUrl).then(rs => rs.json());
  for (const branch of branches) {

    var baseEq = baseBranches.find(bb => bb.name === branch.name && bb.commit?.sha === branch.commit?.sha);
    if (baseEq) {
      continue;
    }



    var dateStr = toShortIso(new Date(date.getTime() - 1000 * 3600 * 24));
    //const commitUrl = repo.url + "/commits?sha=" + branch.name + "&since=" + repo.pushed_at; //date.toISOString();
    const commitUrl = repo.url + "/commits?sha=" + encodeURIComponent(branch.name).replace("%2F", "/") + "&since=" + dateStr;

    //

    var obj = await fetchProxy(commitUrl).then(rs => rs.json()).then(o => o as GithubCommit[]);
    //console.dir(obj);
    newKvp.lastCommit = obj?.[0];

    if (newKvp.lastCommit) {
      newKvp.lastCommit.branch_name = branch.name;
      console.log(`Branch difference: "${branch.name}" in repo ${branchUrl}, Last commit: ${newKvp.lastCommit.commit.message}`);
      //console.dir(newKvp.lastCommit);
    }
  }
  //https://api.github.com/repos/k-u-s/TailBlazer/branches

}

interface githubBranch {
  name: string;
  commit?: { sha: string, url: string };
}

function GetForksHook(urlParam: string | null | undefined, setState: React.Dispatch<React.SetStateAction<AppState>>): { loading: boolean, result: string } {
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);



  const url = urlParam && urlParam.replace("https://www.github.com/", "https://api.github.com/repos/");

  React.useEffect(() => {

    async function getForks() {
      try {
        if (!url)
          return;

        setLoading(true);

        const base: GithubRepo = (await fetchProxy(url).then(rs => rs.json()).then(obj => obj as GithubRepo));

        //base.branches_url
        const baseBranches: githubBranch[] = await fetchProxy(url + "/branches").then(rs => rs.json()).then(o => o as githubBranch[]);

        const forkUrl = url + "/forks";
        const jsobj = await fetchProxy(forkUrl).then(rs => rs.json()).then(obj => obj as GithubRepo[]);
        const promises: Promise<void>[] = [];

        const map: githubMap[] = [];

        for (const repo of jsobj) {
          const newKvp: githubMap = { repo: repo };
          if (repo.pushed_at === base.pushed_at) { // parity, or older than base, ignore..
            continue;
          }
          map.push(newKvp);
          var date = new Date(repo.pushed_at);

          date = new Date(date.getTime() - 10000);

          const branchUrl = repo.url + "/branches";

          promises.push(GetCommits(branchUrl, baseBranches, date, repo, newKvp));
        }

        await Promise.all(promises);

        for (const kvp of map) {
          if (kvp.lastCommit) {
            console.dir(kvp.lastCommit);
            //kvp.commits = kvp.commits?.filter(c => new Date(c.commit.committer.date) == kvp.repo.pushed_at);//  sort((a, b) => new Date(a.commit.committer.date).getTime() - new Date(b.commit.committer.date).getTime());
          }
        }

        //const base = map.filter(kvp => !kvp.repo.fork)[0];
        let forks = map.filter(kvp => kvp.repo.fork && kvp.repo.pushed_at !== base.pushed_at);


        // (p.commits && p.commits[0].commit.committer.date)

        //base 
        //forks = forks.filter(f = );

        const state: AppState = {
          isLoading: false,
          base: base,// { url: base.url, LastUpdate: base.pushed_at },
          forks: forks // forks.map(p => { return { url: p.repo.full_name, LastUpdate: p.repo.pushed_at, LastCommit: p.lastCommit, LastUpdateCommitId: p.lastCommit?.sha } as Fork; })
          //base: jsobj.filter(f => !f.fork).map(p => {   })
        }
        setState(state);
        //setResult(`Forks: ${jsobj.length}`);
      } catch (err) {
        setResult(err);
      }
      setLoading(false);
    }

    if (url !== "") {
      getForks();
    }
  }, [url, setState]);

  return { result, loading };
}


function App() {
  const [state, setState] = useState(DefaultAppState);

  //const effect = useAsyncGithubEffectHook(state.base?.url || '');
  const effect = GetForksHook(state.baseUrl, setState);
  const [result, loading] = [effect.result, effect.loading];

  state.isLoading = loading;


  const onSearchSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();

    const form = evt.currentTarget;
    const elemnts = Array.from(form).filter(subel => subel.tagName === "INPUT") as HTMLInputElement[];

    let url = elemnts[0].value.trimEnd();

    if (url.startsWith("https://www.github.com/")) {
      url = url.replace("https://www.github.com/", "");
    }

    if (url.startsWith("/") || url.startsWith("http")) {
      alert('Invalid url, please paste a github url here');

    }

    url = "https://api.github.com/repos/" + url;
    setState({ ...state, baseUrl: url });
  }

  return <>
    <Container>

      <Header />

      <main role="main">
        <SearchForm onSubmit={onSearchSubmit} />
        {state.isLoading && <div><h1>Loading.... {state.base?.url}</h1></div>}
        {state.base && state.base.url}
        {/* <BodyPlaceHolder /> */}
        <div dangerouslySetInnerHTML={{ __html: result }}></div>

        {state.forks &&
          <table>
            <tbody>
              <tr><th>Fork</th><th>Forks</th><th>Last Updated</th></tr>
              {state.base &&
                <tr><td>{state.base.url}</td><td>{state.base.forks}</td><td>{state.base.pushed_at}</td></tr>
              }
              {state.forks.map((o, ix) => {

                const [LastUpdateCommitId, url, lastDate, forks] = [o?.lastCommit?.sha, o.repo.full_name, o.repo.pushed_at, o.repo.forks];

                //return { url: p.repo.full_name, LastUpdate: p.repo.pushed_at, LastCommit: p.lastCommit, LastUpdateCommitId: p.lastCommit?.sha } as Fork;
                return <tr key={ix}>
                  <td><a href={"https://www.github.com/" + url} target="_blank" rel="noopener noreferrer">{url}</a></td>
                  <td>{forks}</td>
                  <td>{LastUpdateCommitId
                    ? <a target="_blank" rel="noopener noreferrer" href={"https://www.github.com/" + url + "/commit/" + LastUpdateCommitId}>
                        {toShortIso(lastDate)} [{o.lastCommit?.branch_name}] - : {o.lastCommit?.commit.message}
                      </a>
                    : lastDate}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        }
      </main>


      <footer className="text-muted">
        <div className="container">
          <p className="float-right">
            <a href="#top">Back to top</a>
          </p>
          <p>Album example is &copy; Bootstrap, but please download and customize it for yourself!</p>
          <p>New to Bootstrap? <a href="../../">Visit the homepage</a> or read our <a href="../../getting-started/">getting started guide</a>.</p>
        </div>
      </footer>
    </Container>
  </>;
}

export default App;
