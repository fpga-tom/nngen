'use babel';

// notice data is not being loaded from a local json file
// instead we will fetch suggestions from this URL
const API_URL = 'http://localhost:3030/autocomplete'

class AdvancedProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '*'

	}

	getSuggestions(options) {
		const { editor, bufferPosition } = options;

		// getting the prefix on our own instead of using the one Atom provides
		let prefix = this.getPrefix(editor, bufferPosition);
		console.log(prefix);

		// all of our snippets start with "@"
		return this.findMatchingSuggestions(prefix);
	}

	getPrefix(editor, bufferPosition) {
		// the prefix normally only includes characters back to the last word break
		// which is problematic if your suggestions include punctuation (like "@")
		// this expands the prefix back until a whitespace character is met
		// you can tweak this logic/regex to suit your needs
		let line = editor.getTextInRange([0, bufferPosition]);
		return line;
	}

	findMatchingSuggestions(prefix) {
		// using a Promise lets you fetch and return suggestions asynchronously
		// this is useful for hitting an external API without causing Atom to freeze
		return new Promise((resolve) => {
			// fire off an async request to the external API
			fetch(API_URL, { method: 'POST', headers : new Headers(), body:JSON.stringify({text: prefix})})
				.then((response) => {
					// convert raw response data to json
					return response.json();
				})
				.then((json) => {
					// filter json (list of suggestions) to those matching the prefix
					let matchingWords = json.result;

					// bind a version of inflateSuggestion() that always passes in prefix
					// then run each matching suggestion through the bound inflateSuggestion()

					let matchingSuggestions = matchingWords.map((word) => {
						return { text: word, replacementPrefix: '' };
					});

					console.log(matchingSuggestions);

					resolve(matchingSuggestions);

				})
				.catch((err) => {
					// something went wrong
					console.log(err);
				});
		});
	}


}
export default new AdvancedProvider();
