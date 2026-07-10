# Marketing report template

Copy this structure and fill in real numbers. Omit a section entirely (don't leave it as
placeholder text) if that source isn't configured -- write one line noting it's not connected
instead of a fake table.

```markdown
# Marketing report -- <Weekly YYYY-Www | Monthly YYYY-MM>

Period: <start date> to <end date>
Generated: <ISO timestamp>

## Highlights

- <Biggest win, one sentence with the number>
- <Biggest concern, one sentence with the number>
- <Anything else notable -- new campaign launched, algorithm-looking traffic shift, etc.>

## Website traffic (GA4)

| Metric          | This period | Prior period | Change |
| --------------- | ----------- | ------------ | ------ |
| Sessions        |             |              |        |
| Users           |             |              |        |
| Conversions     |             |              |        |
| Engagement rate |             |              |        |

Top channels by sessions:

| Channel | Sessions | Conversions |
| ------- | -------- | ----------- |

Top landing pages:

| Page | Sessions | Conversions |
| ---- | -------- | ----------- |

## Search performance (Search Console)

| Metric           | This period | Prior period | Change |
| ---------------- | ----------- | ------------ | ------ |
| Clicks           |             |              |        |
| Impressions      |             |              |        |
| Average CTR      |             |              |        |
| Average position |             |              |        |

Top queries:

| Query | Clicks | Impressions | Position |
| ----- | ------ | ----------- | -------- |

Notable ranking movement (new top-10s, drops out of top-10):

- <query -- old position to new position>

## Email (Listmonk)

| Metric            | This period | Prior period | Change |
| ----------------- | ----------- | ------------ | ------ |
| Total subscribers |             |              |        |
| New subscribers   |             |              |        |
| Unsubscribes      |             |              |        |

Campaigns sent this period:

| Campaign | Sent | Opens | Clicks | Bounces |
| -------- | ---- | ----- | ------ | ------- |

## Social (Postiz)

Posts published this period, by network:

| Network | Posts | Notes |
| ------- | ----- | ----- |

## SEO actions (monthly report only)

Top 3 actions from this month's `seo-audit` pass, ranked by impact:

1. <action -- page -- why it matters>
2. <action -- page -- why it matters>
3. <action -- page -- why it matters>

## Not connected

- <Any of GA4/GSC/Listmonk/Postiz that had no configured env -- list here, one line each>
```
