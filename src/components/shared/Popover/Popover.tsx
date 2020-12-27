import { React } from 'common';
import { Box } from 'pu2';
import { usePopper, Popper, PopperProps } from 'react-popper';

const anchorStyleMap = {
	'down-left': {
		top: '100%',
		left: '0%'
	},
	'down-left-side': {
		bottom: '0%',
		right: '100%'
	},
	'up-left': {
		bottom: '100%',
		left: '0%'
	},
	'up-left-side': {
		top: '0%',
		right: '100%'
	},
	'down-right': {
		top: '100%',
		right: '0%'
	},
	'down-right-side': {
		bottom: '0%',
		left: '100%'
	},
	'up-right': {
		bottom: '100%',
		right: '0%'
	},
	'up-right-side': {
		top: '0%',
		left: '100%'
	}
};

type PopperOptions = Parameters<typeof usePopper>[2];

interface Props extends PopperOptions {
	children: React.ReactElement;
	referenceElement: PopperProps<any>['referenceElement'];
}

const Popover = ({ children, referenceElement, ...popperOptions }: Props) => {
	const [popperEl, setPopperEl] = React.useState<HTMLElement>(null);

	const { attributes, styles } = usePopper(referenceElement, popperEl, {
		strategy: 'fixed',
		modifiers: [
			{
				name: 'flip'
			}
		],
		...popperOptions
	});

	const props: any = {
		...attributes.popper,
		...styles.popper
	};

	return (
		<Box ref={setPopperEl} backgroundColor="white" zIndex="4" {...props}>
			{children}
		</Box>
	);
};
export default Popover;
