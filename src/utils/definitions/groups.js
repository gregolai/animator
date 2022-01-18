// ONLY USED FOR PARSING WHEN IMPORTING
const groups = {
	margin: {
		computed: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
		parse: (str) => {
			let v = str.split(' ').map((x) => parseFloat(x));
			switch (v.length) {
				case 1:
					return [v[0], v[0], v[0], v[0]]; // Apply to all four sides
				case 2:
					return [v[0], v[1], v[0], v[1]]; // vertical | horizontal
				case 3:
					return [v[0], v[1], v[2], v[1]]; // top | horizontal | bottom
				default:
					return [v[0], v[1], v[2], v[3]];
			}
		}
	}
};

export default groups;
