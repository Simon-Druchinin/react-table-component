import styled, { CSSObject, css } from 'styled-components';
import { media } from './media';
import { TableColumnBase } from './types';

export const CellBase = styled.div<{
	headCell?: boolean;
	noPadding?: boolean;
}>`
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	line-height: normal;
	${({ theme, headCell }) => theme[headCell ? 'headCells' : 'cells'].style};
	${({ noPadding }) => noPadding && 'padding: 0'};
`;

export type CellProps = Pick<
	TableColumnBase,
	'button' | 'grow' | 'maxWidth' | 'minWidth' | 'width' | 'right' | 'center' | 'compact' | 'hide' | 'allowOverflow' | 'freeze' | 'leftOffset'
>;

const freezeStyle = (leftOffset: string) => {
  return (`
    position: sticky;
    background-color: inherit;
    left: ${leftOffset};
    z-index: 1;
  `)
}

// Flex calculations
export const CellExtended = styled(CellBase).attrs<CellProps>(props => ({
  style: {
    maxWidth: props.width ? props.width : props.maxWidth ? props.maxWidth : '100%',
    minWidth: props.width ? props.width : props.minWidth ? props.minWidth : '100px',
  }
}))<CellProps>`
	flex-grow: ${({ button, grow }) => (grow === 0 || button ? 0 : grow || 1)};
	flex-shrink: 0;
	flex-basis: 0;
	${({ right }) => right && 'justify-content: flex-end'};
	${({ button, center }) => (center || button) && 'justify-content: center'};
	${({ compact, button }) => (compact || button) && 'padding: 0'};

	/* handle hiding cells */
	${({ hide }) =>
		hide &&
		hide === 'sm' &&
		media.sm`
    display: none;
  `};
	${({ hide }) =>
		hide &&
		hide === 'md' &&
		media.md`
    display: none;
  `};
	${({ hide }) =>
		hide &&
		hide === 'lg' &&
		media.lg`
    display: none;
  `};
	${({ hide }) =>
		hide &&
		Number.isInteger(hide) &&
		media.custom(hide as number)`
    display: none;
  `};
  /* handle freezing cells */
	${({ freeze, leftOffset }) =>
		freeze &&
		freeze === 'sm' &&
		leftOffset &&
		media.min_sm`
    ${freezeStyle(leftOffset) as unknown as CSSObject}
  `};
	${({ freeze, leftOffset }) =>
		freeze &&
		freeze === 'md' &&
		leftOffset &&
		media.min_md`
    ${freezeStyle(leftOffset) as unknown as CSSObject}
  `};
	${({ freeze, leftOffset }) =>
		freeze &&
		freeze === 'lg' &&
		leftOffset &&
		media.min_lg`
    ${freezeStyle(leftOffset) as unknown as CSSObject}
  `};
	${({ freeze, leftOffset }) =>
		freeze &&
		leftOffset &&
		Number.isInteger(freeze) &&
		media.min_custom(freeze as number)`
		${freezeStyle(leftOffset) as unknown as CSSObject}
	`};
	${({ freeze, leftOffset }) =>
		freeze === true &&
		leftOffset &&
		css`
		${freezeStyle(leftOffset)}
  `};
`;
