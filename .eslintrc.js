// https://docs.expo.dev/guides/using-eslint/
module.exports = {
	extends: "expo",
	ignorePatterns: ["/dist/*"],
	overrides: [
		{
			files: ["jest.setup.js", "jest.setup.before-env.js", "__mocks__/**/*.js"],
			env: {
				jest: true,
			},
		},
	],
};
