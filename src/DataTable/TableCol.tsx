import * as React from 'react';
import styled, { css } from 'styled-components';
import { CellExtended, CellProps } from './Cell';
import NativeSortIcon from '../icons/NativeSortIcon';
import { equalizeId } from './util';
import { TableColumn, SortAction, SortOrder } from './types';

interface ColumnStyleProps extends CellProps {
	isDragging?: boolean;
	onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ColumnStyled = styled(CellExtended)<ColumnStyleProps>`
	${({ button }) => button && 'text-align: center'};
	${({ theme, isDragging }) => isDragging && theme.headCells.draggingStyle};
`;

interface ColumnSortableProps {
	disabled: boolean;
	sortActive: boolean;
}

const sortableCSS = css<ColumnSortableProps>`
	cursor: pointer;
	span.__rdt_custom_sort_icon__ {
		i,
		svg {
			transform: 'translate3d(0, 0, 0)';
			${({ sortActive }) => (sortActive ? 'opacity: 1' : 'opacity: 0')};
			color: inherit;
			font-size: 18px;
			height: 18px;
			width: 18px;
			backface-visibility: hidden;
			transform-style: preserve-3d;
			transition-duration: 95ms;
			transition-property: transform;
		}

		&.asc i,
		&.asc svg {
			transform: rotate(180deg);
		}
	}

	${({ sortActive }) =>
		!sortActive &&
		css`
			&:hover,
			&:focus {
				opacity: 0.7;

				span,
				span.__rdt_custom_sort_icon__ * {
					opacity: 0.7;
				}
			}
		`};
`;

const ColumnSortable = styled.div<ColumnSortableProps>`
	display: inline-flex;
	align-items: center;
	justify-content: inherit;
	height: 100%;
	width: 100%;
	outline: none;
	user-select: none;
	overflow: hidden;
	${({ disabled }) => !disabled && sortableCSS};
`;

const ColumnText = styled.div`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const ResizeHandle = styled.div`
	display: block;
	position: absolute;
	cursor: col-resize;
	width: 7px;
	min-height: 52px;
	right 0;
	top: 0;
	z-index: 2;
	border-right: 2px solid transparent;
	&:hover {
		border-color: #ccc;
	}
	&.active {
		border-color: #add8e6;
	}
`;

type TableColProps<T> = {
	column: TableColumn<T>;
	disabled: boolean;
  draggingColumnId?: string | number;
  resizingColumnId?: string | number;
	sortIcon?: React.ReactNode;
	pagination: boolean;
	paginationServer: boolean;
	persistSelectedOnSort: boolean;
	selectedColumn: TableColumn<T>;
	sortDirection: SortOrder;
	sortServer: boolean;
	selectableRowsVisibleOnly: boolean;
	onSort: (action: SortAction<T>) => void;
	onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleResizeStart: (e: React.PointerEvent<HTMLDivElement>) => void;
	setColumnOffset: (columnOffset: number, columnId: string | number) => void;
};

function TableCol<T>({
	column,
	disabled,
  draggingColumnId,
  resizingColumnId,
	selectedColumn = {},
	sortDirection,
	sortIcon,
	sortServer,
	pagination,
	paginationServer,
	persistSelectedOnSort,
	selectableRowsVisibleOnly,
	onSort,
	onDragStart,
	onDragOver,
	onDragEnd,
	onDragEnter,
  onDragLeave,
  handleResizeStart,
	setColumnOffset,
}: TableColProps<T>): JSX.Element | null {

	const [showTooltip, setShowTooltip] = React.useState(false);
  const columnRef = React.useRef<HTMLDivElement | null>(null);
  const [leftOffset, setLeftOffset] = React.useState(0);

	React.useEffect(() => {
		if (columnRef.current) {
			setShowTooltip(columnRef.current.scrollWidth > columnRef.current.clientWidth);
		}
  }, [showTooltip]);

  React.useEffect(() => {
    if (columnRef.current && column.freeze && column.id) {
      const columnOffset = (columnRef.current.parentNode?.parentNode as HTMLDivElement).offsetLeft
      setColumnOffset(columnOffset, column.id)
      setLeftOffset(columnOffset)
		}
	}, [leftOffset]);

  React.useEffect(() => {
    if (columnRef.current && column.freeze && column.id && (equalizeId(column.id, draggingColumnId) || equalizeId(column.id, resizingColumnId))) {
      const columnOffset = (columnRef.current.parentNode?.parentNode as HTMLDivElement).offsetLeft
			setColumnOffset(columnOffset, column.id)
		}
	}, [draggingColumnId, resizingColumnId]);

	if (column.omit) {
		return null;
	}

	const handleSortChange = () => {
		if (!column.sortable && !column.selector) {
			return;
		}

		let direction = sortDirection;

		if (equalizeId(selectedColumn.id, column.id)) {
			direction = sortDirection === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		}

		onSort({
			type: 'SORT_CHANGE',
			sortDirection: direction,
			selectedColumn: column,
			clearSelectedOnSort:
				(pagination && paginationServer && !persistSelectedOnSort) || sortServer || selectableRowsVisibleOnly,
		});
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter') {
			handleSortChange();
		}
	};

	const renderNativeSortIcon = (sortActive: boolean) => (
		<NativeSortIcon sortActive={sortActive} sortDirection={sortDirection} />
	);

	const renderCustomSortIcon = () => (
		<span className={[sortDirection, '__rdt_custom_sort_icon__'].join(' ')}>{sortIcon}</span>
	);

	const sortActive = !!(column.sortable && equalizeId(selectedColumn.id, column.id));
	const disableSort = !column.sortable || disabled;
	const nativeSortIconLeft = column.sortable && !sortIcon && !column.right;
	const nativeSortIconRight = column.sortable && !sortIcon && column.right;
	const customSortIconLeft = column.sortable && sortIcon && !column.right;
	const customSortIconRight = column.sortable && sortIcon && column.right;

	return (
		<ColumnStyled
			data-column-id={column.id}
			className="rdt_TableCol"
			headCell
			allowOverflow={column.allowOverflow}
			button={column.button}
			compact={column.compact}
			grow={column.grow}
      hide={column.hide}
      freeze={column.freeze}
      leftOffset={column.leftOffset}
			maxWidth={column.maxWidth}
			minWidth={column.minWidth}
			right={column.right}
			center={column.center}
			width={column.width}
			draggable={column.reorder && resizingColumnId === ''}
			isDragging={equalizeId(column.id, draggingColumnId)}
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
		>
			{column.name && (
				<ColumnSortable
					data-column-id={column.id}
					data-sort-id={column.id}
					role="columnheader"
					tabIndex={0}
					className="rdt_TableCol_Sortable"
					onClick={!disableSort ? handleSortChange : undefined}
					onKeyPress={!disableSort ? handleKeyPress : undefined}
					sortActive={!disableSort && sortActive}
					disabled={disableSort}
				>
					{!disableSort && customSortIconRight && renderCustomSortIcon()}
					{!disableSort && nativeSortIconRight && renderNativeSortIcon(sortActive)}

					{typeof column.name === 'string' ? (
						<ColumnText title={showTooltip ? column.name : undefined} ref={columnRef} data-column-id={column.id}>
							{column.name}
						</ColumnText>
					) : (
						<ColumnText ref={columnRef} data-column-id={column.id}>
							{column.name}
						</ColumnText>
					)}

					{!disableSort && customSortIconLeft && renderCustomSortIcon()}
					{!disableSort && nativeSortIconLeft && renderNativeSortIcon(sortActive)}
				</ColumnSortable>
      )}
      {column.resize && <ResizeHandle className={`rdt_ResizeHandle ${equalizeId(column.id, resizingColumnId) ? 'active' : ''}`} onPointerDown={handleResizeStart} />}
		</ColumnStyled>
	);
}

export default React.memo(TableCol) as typeof TableCol;
