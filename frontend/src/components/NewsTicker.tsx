import React, { useState, useEffect } from 'react';

// Split the API key into two parts to prevent bots from scraping cause im too lazy to make an enviornment variable
const API_KEY_PART1 = "c740dac6a061445ea31";
const API_KEY_PART2 = "afa052417f0e2";
const API_KEY = API_KEY_PART1 + API_KEY_PART2;

const NewsTicker = () => {
  const [headlines, setHeadlines] = useState<{ title: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${API_KEY}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "ok") {
          const news = data.articles.map((article: any) => ({
            title: article.title,
            url: article.url
          }));
          setHeadlines(news);
        } else {
          setError("Error fetching headlines");
        }
      })
      .catch(err => {
        console.error("Error fetching news:", err);
        setError("Error fetching news");
      });
  }, []);

  const renderHeadlines = (prefix: string) => (
    headlines.map((news, index) => (
      <React.Fragment key={`${prefix}-${index}`}>
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginRight: '20px',
            textDecoration: 'none',
            color: 'black'
          }}
        >
          {news.title}
        </a>
        {index < headlines.length - 1 && (
          <span style={{
            display: 'inline-block',
            marginRight: '20px',
            borderLeft: '1px solid black',
            height: '1em',
            verticalAlign: 'middle'
          }} />
        )}
      </React.Fragment>
    ))
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#f5f5f5',
      padding: '5px 10px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      border: '5px solid red',
      fontFamily: "'Oswald', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      animation: 'flash-border 2s infinite'
    }}>
      <div style={{
        flexShrink: 0,
        fontWeight: 'bold',
        marginRight: '20px',
        fontSize: '1.2em',
        color: 'black'
      }}>
        TOP HEADLINES:
      </div>
      <div style={{ flexGrow: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {error ? (
          <span style={{ color: 'red' }}>{error}</span>
        ) : (
          <div style={{
            display: 'inline-block',
            animation: 'scroll-left 200s linear infinite'
          }}>
            {renderHeadlines("original")}
            {renderHeadlines("duplicate")}
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes flash-border {
            0% { border-color: red; }
            50% { border-color: white; }
            100% { border-color: red; }
          }
        `}
      </style>
    </div>
  );
};

export default NewsTicker;
