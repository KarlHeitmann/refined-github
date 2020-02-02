import select from 'select-dom';
import checkIcon from 'octicon/check.svg';
import elementReady from 'element-ready';
import features from '../libs/features';

function addMergeLink(): void {
	if (!features.isPRList()) {
		return;
	}

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total  // This apparently only appears when the query contains is:merged
	const lastLink = select<HTMLAnchorElement>('.table-list-header-toggle > :last-child')!;

	// In this case, it's a "Total" link, which appears if the query includes "is:merged".
	// This means that the link itself is showing the number of merged issues, so it can be renamed to "Merged".
	if (!lastLink.search.includes('is%3Aclosed')) {
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent!.replace('Total', 'Merged');
		return;
	}

	// In this case, `lastLink` is expected to be a "Closed" link
	const mergeLink = lastLink.cloneNode(true);
	mergeLink.textContent = 'Merged';
	mergeLink.search = mergeLink.search.replace('is%3Aclosed', 'is%3Amerged');
	mergeLink.classList.toggle('selected', location.search.includes('is%3Amerged'));
	lastLink.after(' ', mergeLink);
}

function togglableFilters(): void {
	for (const link of select.all<HTMLAnchorElement>('.table-list-header-toggle a')) {
		select('.octicon', link)?.remove();
		if (link.classList.contains('selected')) {
			link.prepend(checkIcon());
			link.search = link.search.replace(/is%3A(open|closed|merged)/, '');
		}
	}
}

async function init(): Promise<void | false> {
	await elementReady('.table-list-filters + *');

	addMergeLink();
	togglableFilters();
}

features.add({
	id: __featureName__,
	description: 'Lets you toggle between is:open/is:closed/is:merged filters in searches.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/73605061-2125ed00-45cc-11ea-8cbd-41a53ae00cd3.gif',
	include: [
		features.isDiscussionList
	],
	load: features.nowAndOnAjaxedPages,
	init
});
