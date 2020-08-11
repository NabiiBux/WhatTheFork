import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';
// import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import { Container } from "react-bootstrap";

import { AppState, DefaultAppState, Fork } from './_types';
import { Header } from './header';
//import { BodyPlaceHolder } from './bodyPlaceholder';
import { SearchForm } from './searchForm';
import { exception } from 'console';
import { GithubRepo } from './generated/github';
import { GithubCommit } from './generated/githubcommits';

function useAsyncGithubEffectHook(url: string): { loading: boolean, result: string } {
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchBookList() {
      try {
        setLoading(true);

        //https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors
        var proxyUrl = 'https://cors-anywhere.herokuapp.com/', targetUrl = url + '/network/members';
        const html = await fetch(proxyUrl + targetUrl)
          .then(blob => blob.text())
          .catch(e => { console.log(e); return e; });


        //https://api.github.com/repos/RolandPheasant/TailBlazer/forks

        let output = '';
        // console.log(json);
        const newDom = document.createElement('html');
        newDom.innerHTML = html;
        const forkParent = newDom.querySelector('#network');
        if (!forkParent) { throw "couldn't find fork node"; }

        //const currentHost = window.location.href.split('/')[0];

        output = '<ul>'
        for (const fork of Array.from(forkParent.querySelectorAll('.repo'))) {
          output += '<li>';
          if (fork.querySelector('img.network-tree') == null) {
            output += '[Root] ';
          }

          const link = fork.querySelector('a:not([class]):not([data-hovercard-type])') as HTMLAnchorElement;
          if (!link)
            continue;

          output += 'https://www.github.com' + link.pathname; // link.href.replace( currentHost, "https://www.github.com/");
          output += '</li>';
        }
        output += '</ul>';

        setResult(output);

        // setResult(
        //   json.items.map(item => {
        //     console.log(item.volumeInfo.title);
        //     return item.volumeInfo.title;
        //   })
        // );
      } catch (error) {
        setResult(error);
      }
      setLoading(false);
    }

    if (url !== "") {
      fetchBookList();
    }
  }, [url]);

  return { result, loading };
}


interface githubMap {
  repo: GithubRepo;
  commits?: GithubCommit[];
}

function fetchProxy(url: string): Promise<Response> {
  //https://nordicapis.com/10-free-to-use-cors-proxies/
  let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  proxyUrl = 'https://thingproxy.freeboard.io/fetch/';
  return fetch(proxyUrl + url);
}

function GetForksHook(url: string, setState: React.Dispatch<React.SetStateAction<AppState>>): { loading: boolean, result: string } {
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function getForks() {
      try {
        setLoading(true);

        url = url.replace("https://www.github.com/", "https://api.github.com/repos/");

        const base: GithubRepo = (await fetchProxy(url).then(rs => rs.json()).then(obj => obj as GithubRepo));

        const forkUrl = url + "/forks";
        //const url2 = "https://api.github.com/repos/RolandPheasant/TailBlazer/forks";

        const jsobj = await fetchProxy(forkUrl).then(rs => rs.json()).then(obj => obj as GithubRepo[]);

        //const promises: Promise<GithubCommit[]>[] = [];
        const promises: Promise<void>[] = [];

        const map: githubMap[] = [];

        for (const repo of jsobj) {
          const newKvp: githubMap = { repo: repo };
          if (repo.pushed_at === base.pushed_at) { // parity, or older than base, ignore..
            continue;
          }
          map.push(newKvp);
          var date = new Date(repo.pushed_at);
          
          date = new Date(date.getTime() - 100);

          const branchUrl = repo.url + "/branches";
          promises.push((async function() {

            var branches : any = await fetchProxy(branchUrl).then(rs => rs.json());
            for(const branch of branches) {
              //const commitUrl = repo.url + "/commits?sha=" + branch.name + "&since=" + repo.pushed_at; //date.toISOString();
              const commitUrl = repo.url + "/commits?sha=" + branch.name + "&since=" + date.toISOString();
              promises.push(
                  fetchProxy(commitUrl).then(rs => rs.json())
                  .then(obj => { 
                    newKvp.commits = obj as GithubCommit[]; 
                    //return newKvp.commits; 
                  }));
            }
            //https://api.github.com/repos/k-u-s/TailBlazer/branches
            
          })());
        }

        await Promise.all(promises);

        for (const kvp of map) {
          console.dir(kvp.commits);
          kvp.commits = kvp.commits?.filter(c => new Date(c.commit.committer.date) == kvp.repo.pushed_at);//  sort((a, b) => new Date(a.commit.committer.date).getTime() - new Date(b.commit.committer.date).getTime());
        }

        //const base = map.filter(kvp => !kvp.repo.fork)[0];
        let forks = map.filter(kvp => kvp.repo.fork && kvp.repo.pushed_at != base.pushed_at);


        // (p.commits && p.commits[0].commit.committer.date)

        //base 
        //forks = forks.filter(f = );

        const state: AppState = {
          isLoading: false,
          base: { url: base.url, LastUpdate: base.pushed_at },
          forks: forks.map(p => { return { url: p.repo.full_name, LastUpdate: p.repo.pushed_at, LastUpdateCommitId: p.commits?.[0]?.sha } as Fork; })
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
  }, [url]);

  return { result, loading };
}


function App() {
  const [state, setState] = useState(DefaultAppState);

  //const effect = useAsyncGithubEffectHook(state.base?.url || '');
  const effect = GetForksHook(state.base?.url || '', setState);
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

    url = "https://www.github.com/" + url;
    setState({ ...state, base: { url: url } })
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
            <tr><th>Fork</th><th>Last Updated</th></tr>
            {state.base &&
              <tr><td>{state.base.url}</td><td>{state.base.LastUpdate}</td></tr>
            }
            {state.forks.map((o, ix) => {
              return <tr key={ix}>
                <td><a href={"https://www.github.com/" + o.url} target="_blank">{o.url}</a></td>
                <td>{o.LastUpdateCommitId
                  ? <a target="_blank" href={"https://www.github.com/" + o.url + "/commit/" + o.LastUpdateCommitId}>{o.LastUpdate} - {o.LastUpdateCommitId}</a>
                  : o.LastUpdate}
                </td>
              </tr>;
            })}
          </table>
        }
      </main>


      <footer className="text-muted">
        <div className="container">
          <p className="float-right">
            <a href="#">Back to top</a>
          </p>
          <p>Album example is &copy; Bootstrap, but please download and customize it for yourself!</p>
          <p>New to Bootstrap? <a href="../../">Visit the homepage</a> or read our <a href="../../getting-started/">getting started guide</a>.</p>
        </div>
      </footer>
    </Container>
  </>;
}

export default App;
