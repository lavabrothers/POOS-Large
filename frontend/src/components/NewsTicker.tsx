import React, { useState, useEffect, useRef } from 'react';

interface Headline {
  title: string;
  url: string;
}

const NewsTicker: React.FC = () => {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tickerRef = useRef<HTMLDivElement | null>(null);
  const [animationDuration, setAnimationDuration] = useState<number>(60); //default duration, the non-default is calculated based on device width

  useEffect(() => {
    fetch('http://134.122.3.46:3000/api/newsticker')
      .then(response => response.json())
      .then(data => {
        if (data.status === "ok" && data.articles && Array.isArray(data.articles)) {
          const news: Headline[] = data.articles.map((article: any) => ({
            title: article.title,
            url: article.url,
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

  useEffect(() => {
    if (tickerRef.current) {
      const contentWidth = tickerRef.current.offsetWidth; //calculating scroll speed based on device width
      const speed = 50;
      const duration = (contentWidth / 2) / speed;
      setAnimationDuration(duration);
    }
  }, [headlines]);

  const renderHeadlines = () => (
    headlines.map((news, index) => (
      <React.Fragment key={index}>
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginRight: '20px',
            textDecoration: 'none',
            color: 'black',
            whiteSpace: 'nowrap'
          }}
        >
          {news.title}
        </a>
        {index < headlines.length - 1 && (
          <span
            style={{
              display: 'inline-block',
              margin: '0 20px',
              borderLeft: '1px solid black',
              height: '1em',
              verticalAlign: 'middle'
            }}
          />
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
      padding: '2px 15px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      border: '5px solid red',
      fontFamily: "'Oswald', 'Helvetica Neue', Helvetica, Arial, sans-serif",
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
          <div
            ref={tickerRef}
            style={{
              display: 'inline-block',
              animation: headlines.length > 0 ? `scroll-left ${animationDuration}s linear infinite` : 'none'
            }}
          >
            <span style={{ display: 'inline-block' }}>{renderHeadlines()}</span>
            <span style={{ display: 'inline-block' }}>{renderHeadlines()}</span>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
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
