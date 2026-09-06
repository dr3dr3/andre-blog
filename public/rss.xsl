<?xml version="1.0" encoding="UTF-8"?>
<!--
    What a browser shows when someone opens /rss.xml.

    Without this they get a wall of raw XML, or Chrome's download prompt, which
    reads as the site being broken rather than as a feed. It is a stylesheet
    applied by the browser to the feed itself, so it costs the site nothing: no
    page loads it, and Lighthouse never sees it. See docs/PERFORMANCE.md.

    Self-contained by necessity — an XSL result has no access to the site's
    stylesheet, so the tokens it needs are repeated here. They are the only
    literal colours outside tokens.css, and they are a copy, not a second
    source: if the palette moves, this moves with it.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:atom="http://www.w3.org/2005/Atom">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/rss/channel">
        <html lang="en-AU">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title><xsl:value-of select="title"/> — feed</title>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
                <style>
                    @font-face {
                        font-family: 'JetBrains Mono';
                        font-style: normal;
                        font-weight: 400 700;
                        font-display: swap;
                        src: url('/fonts/jetbrains-mono-latin.woff2') format('woff2');
                    }
                    @font-face {
                        font-family: 'Newsreader';
                        font-style: normal;
                        font-weight: 400 700;
                        font-display: swap;
                        src: url('/fonts/newsreader-latin.woff2') format('woff2');
                    }
                    :root {
                        color-scheme: light dark;
                        --ink: #17191c; --paper: #f5f5f2; --rule: #d8dad5;
                        --muted: #4d514d; --faint: #6b6f6a; --wash: #eaece7;
                        --info: #2c5578;
                        --mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
                        --serif: 'Newsreader', Georgia, 'Times New Roman', serif;
                    }
                    @media (prefers-color-scheme: dark) {
                        :root {
                            --ink: #e9e4db; --paper: #15181b; --rule: #2a2f33;
                            --muted: #b3b8b0; --faint: #8f968f; --wash: #1c2024;
                            --info: #84aecf;
                        }
                    }
                    * { box-sizing: border-box; }
                    body {
                        margin: 0; background: var(--paper); color: var(--ink);
                        font-family: var(--serif); font-size: 17px; line-height: 1.7;
                        padding: 0 1.5rem 4rem;
                    }
                    ::selection { background: var(--info); color: var(--paper); }
                    main { max-width: 62ch; margin-inline: auto; }
                    header { padding: 4.5rem 0 1rem; border-bottom: 1.5px solid var(--rule); }
                    h1 {
                        font-family: var(--mono); font-weight: 500; font-size: 28px;
                        letter-spacing: -0.035em; line-height: 1.1; margin: 0;
                    }
                    h1 b { font-weight: 700; }
                    .line { color: var(--muted); margin: 0.6rem 0 0; max-width: 44ch; line-height: 1.5; }
                    .label {
                        font-family: var(--mono); font-size: 11.5px; font-weight: 500;
                        text-transform: uppercase; letter-spacing: 0.07em; color: var(--faint);
                    }
                    .banner {
                        margin: 3.5rem 0 0; padding: 1rem 1.15rem; background: var(--wash);
                        border-radius: 6px; font-family: var(--mono); font-size: 12.5px;
                        line-height: 1.7; color: var(--muted);
                    }
                    .banner code { color: var(--ink); word-break: break-all; }
                    ul { list-style: none; margin: 3.5rem 0 0; padding: 0; }
                    li + li { margin-top: 3rem; }
                    .kick { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 0.55rem; }
                    .kick .fill { flex: 1 1 auto; height: 1px; background: linear-gradient(90deg, var(--rule), transparent); }
                    .title {
                        font-family: var(--mono); font-weight: 500; font-size: 20px;
                        letter-spacing: -0.025em; line-height: 1.25;
                        color: var(--ink); text-decoration: none;
                    }
                    .title:hover { text-decoration: underline; }
                    .summary { margin: 0.5rem 0 0; color: var(--muted); }
                    footer {
                        max-width: 62ch; margin: 5rem auto 0; padding-top: 1rem;
                        border-top: 1.5px solid var(--rule);
                    }
                    footer p { font-family: var(--mono); font-size: 11.5px; color: var(--faint); margin: 0; }
                    footer a { color: var(--info); }
                </style>
            </head>
            <body>
                <main>
                    <header>
                        <h1><b>André</b> Dreyer</h1>
                        <p class="line"><xsl:value-of select="description"/></p>
                    </header>

                    <div class="banner">
                        This is the <strong>RSS feed</strong>, not the site. Paste the address below
                        into a reader to get new posts as they appear.<br/>
                        <code><xsl:value-of select="atom:link/@href"/></code>
                    </div>

                    <ul>
                        <xsl:for-each select="item">
                            <li>
                                <p class="kick">
                                    <span class="label"><xsl:value-of select="substring(pubDate, 6, 11)"/></span>
                                    <span class="fill"></span>
                                </p>
                                <a class="title" href="{link}"><xsl:value-of select="title"/></a>
                                <p class="summary"><xsl:value-of select="description"/></p>
                            </li>
                        </xsl:for-each>
                    </ul>

                    <footer>
                        <p>
                            <a href="{link}">Back to andredreyer.com</a>
                        </p>
                    </footer>
                </main>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
