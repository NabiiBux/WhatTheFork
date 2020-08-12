import React from "react";

export function useAsyncGithubEffectHook(url: string): { loading: boolean, result: string } {
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
          if (!forkParent) { throw new Error("couldn't find fork node"); }
  
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
  