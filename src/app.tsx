import { useCallback, useEffect, useState } from "preact/hooks";
import "./app.css";

let Mecab = null;

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

async function parse(text: string) {
  if (!Mecab) {
    // @ts-ignore
    Mecab = (await import("https://unpkg.com/mecab-wasm@1.0.3/lib/mecab.js"))
      .default;
    console.log("mecab loaded as:", Mecab);
  }

  console.log("parsing", text);

  await Mecab.waitReady();

  const lines = text.split("\n");

  const results = await Promise.all(
    lines.map(async (line) => {
      return Mecab.query(line);
    })
  );

  return (
    <>
      {results.map((r, i) => {
        const annotated = r.map((item) => {
          const pron = item.pronunciation?.split("").map(kanaToHira).join("");
          if (pron === item.word) {
            return item.word;
          }

          return (
            <ruby>
              {item.word}
              <rp>(</rp>
              <rt>{pron}</rt>
              <rp>)</rp>
            </ruby>
          );
      });
        if (i > 0) {
          annotated.unshift(<br />);
        }
        return annotated;
      })}
    </>
  );
}

export function App() {
  const [result, setResult] = useState(<></>);
  const [query, setQuery] = useState("明日は晴れるでしょう");

  const cb = useCallback(async () => {
    const result = await parse(query);
    console.log(result);

    setResult(result);
  }, [query]);

  useEffect(() => {
    cb();
  }, [cb]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 1fr",

        height: "80%",
        width: "100%",
      }}
    >
      <textarea
        id="input"
        rows={20}
        cols={40}
        value={query}
        onInput={(e) => setQuery((e.target as HTMLTextAreaElement).value)}
      />
      <div />
      <div
        id="output"
        style={{
          fontSize: "2rem",
          lineHeight: "1.8",
          textAlign: "left",
        }}
      >
        {result}
      </div>
    </div>
  );
}
