# Miles Tracker — Swipe Smarter, Travel Further

A standalone web tool for tracking monthly credit card spend and calculating miles earned across multiple Singapore miles cards. Built for the Podium x Chloe Low workshop.

## Features

- **Multi-card support** — select all cards you hold and the tool assigns the best card per spend category
- **Cap-aware logic** — once a card hits its monthly 4 mpd cap, spend automatically overflows to the next best card
- **Split spend display** — shows exactly how spend is divided across cards when a cap is hit
- **Cap progress bars** — visual indicator for each capped card's monthly usage
- **Full strategy view** — see your entire card stack and spend breakdown in one place
- **Card catalog** — all 8 cards with rates, caps, eligible categories, and perks
- **Export to CSV** — download your monthly breakdown as a spreadsheet
- **Notion export** — formats your data as a Notion-ready markdown page
- **Disclaimer & CTA** — miles-specific disclaimer and Chloe Low contact links

## Cards included

| Card | Bank | 4 mpd cap | Base rate |
|------|------|-----------|-----------|
| Preferred Platinum Visa | UOB | S$1,110/mo | 0.4 mpd |
| Visa Signature | UOB | S$1,000/mo | 1.4 mpd |
| Woman's Card | DBS | S$1,500/mo | 1.2 mpd |
| Lady's Card | UOB | S$1,000/mo | 1.4 mpd |
| Citi Rewards | Citi | S$1,000/mo | 1.2 mpd |
| KrisFlyer UOB | UOB | No cap | 1.2 mpd |
| PremierMiles | Citi | No cap | 1.2 mpd |
| Altitude | DBS | S$5,000/mo | 1.2 mpd |

## Setup

No build step needed. This is a plain HTML/CSS/JS project.

1. Clone or download this repo
2. Open `index.html` in a browser — or deploy to GitHub Pages

## Deploy to GitHub Pages

1. Push the files to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your tool will be live at `https://yourusername.github.io/repo-name`

## Files

```
index.html   — markup and structure
style.css    — all styling (DM Sans + DM Serif Display fonts, mesh gradient)
app.js       — card data, cap logic, calculations, export functions
README.md    — this file
```

## Disclaimer

Miles estimates are indicative only. Actual miles earned depend on each bank's prevailing terms and conditions. Earn rates, caps, and eligible categories are subject to change without notice. Always verify with your bank.

---

*Podium x Chloe Low · [@chloelow_](https://instagram.com/chloelow_)*
