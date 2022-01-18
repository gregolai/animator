import { color } from '@sqs/utils';

export default {
	colorString: (str) => {
		if (typeof str !== 'string') return false;
		return color.parseColor(str) !== null;
	},

	enumValue: (str, list) => {
		return list.indexOf(str) !== -1;
	},

	floatString: (str) => {
		return !isNaN(parseFloat(str));
	}
};
