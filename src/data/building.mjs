// Public repos Andreas has pushed real commits to in the last 90 days.
// Fetched at build time; the daily CI cron keeps it fresh. Any failure
// (offline local build, API hiccup, rate limit) returns [] so the section
// simply doesn't render and the build never fails.

const USERNAME = 'aholstenson';
const DAYS = 90;
const MAX_REPOS = 8;

// Repos that aren't really "what I'm building": the profile README repo
// and this site itself.
const EXCLUDE = new Set([`${USERNAME}/${USERNAME}`, `${USERNAME}/holstenson.se`]);

export default async function () {
	const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;

	const headers = {
		Accept: 'application/vnd.github+json',
		'User-Agent': `${USERNAME}-site-build`,
		'X-GitHub-Api-Version': '2022-11-28'
	};
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;

	try {
		// fullName -> latest push timestamp
		const seen = new Map();

		// Events API caps at 300 events / 90 days, whichever comes first.
		for (let page = 1; page <= 3; page++) {
			const res = await fetch(
				`https://api.github.com/users/${USERNAME}/events/public?per_page=100&page=${page}`,
				{ headers }
			);
			if (!res.ok) {
				console.warn(`[building] GitHub API ${res.status}; skipping section`);
				return [];
			}

			const events = await res.json();
			if (!Array.isArray(events) || events.length === 0) break;

			for (const ev of events) {
				if (ev.type !== 'PushEvent') continue;
				// The public events payload is slimmed (no commit count), but a
				// PushEvent means commits were pushed; skip only no-op pushes.
				if (ev.payload?.head === ev.payload?.before) continue;
				const fullName = ev.repo?.name;
				if (!fullName || EXCLUDE.has(fullName)) continue;

				const ts = new Date(ev.created_at).getTime();
				if (ts < since) continue;

				const prev = seen.get(fullName);
				if (prev === undefined || ts > prev) seen.set(fullName, ts);
			}

			// Events are reverse-chronological; once the page tail is older
			// than the window there's nothing left to find.
			const tail = events[events.length - 1];
			if (tail && new Date(tail.created_at).getTime() < since) break;
		}

		return Array.from(seen.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, MAX_REPOS)
			.map(([fullName]) => {
				const [owner, repo] = fullName.split('/');
				return {
					// strip own-user prefix; keep owner for org/other repos
					name: owner === USERNAME ? repo : fullName,
					url: `https://github.com/${fullName}`
				};
			});
	} catch (err) {
		console.warn(`[building] skipped: ${err.message}`);
		return [];
	}
}
