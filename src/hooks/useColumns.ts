import * as React from 'react';
import { decorateColumns, findColumnIndexById, getSortDirection } from '../DataTable/util';
import useDidUpdateEffect from '../hooks/useDidUpdateEffect';
import { SortOrder, TableColumn } from '../DataTable/types';

type ColumnsHook<T> = {
	tableColumns: TableColumn<T>[];
	draggingColumnId: string;
	handleDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
	defaultSortDirection: SortOrder;
	defaultSortColumn: TableColumn<T>;
    resizingColumnId: string;
    handleResizeStart: (e: React.PointerEvent<HTMLDivElement>) => void;
    setColumnOffset: (columnOffset: number, columId: string | number) => void;
};

function useColumns<T>(
	columns: TableColumn<T>[],
	onColumnOrderChange: (nextOrder: TableColumn<T>[]) => void,
	defaultSortFieldId: string | number | null | undefined,
	defaultSortAsc: boolean,
): ColumnsHook<T> {
	const [tableColumns, setTableColumns] = React.useState<TableColumn<T>[]>(() => decorateColumns(columns));
	const [draggingColumnId, setDraggingColumn] = React.useState('');
    const [resizingColumnId, setResizingColumn] = React.useState('');
    const [resizingColumnElement, setResizingColumnElement] = React.useState<EventTarget | null>(null);
	const sourceColumnId = React.useRef('');

	useDidUpdateEffect(() => {
		setTableColumns(decorateColumns(columns));
	}, [columns]);

	const handleDragStart = React.useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const { attributes } = e.target as HTMLDivElement;
			const id = attributes.getNamedItem('data-column-id')?.value;

			if (id) {
				sourceColumnId.current = tableColumns[findColumnIndexById(tableColumns, id)]?.id?.toString() || '';

				setDraggingColumn(sourceColumnId.current);
			}
		},
		[tableColumns],
	);

	const handleDragEnter = React.useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const { attributes } = e.target as HTMLDivElement;
			const id = attributes.getNamedItem('data-column-id')?.value;

			if (id && sourceColumnId.current && id !== sourceColumnId.current) {
				const selectedColIndex = findColumnIndexById(tableColumns, sourceColumnId.current);
				const targetColIndex = findColumnIndexById(tableColumns, id);
				const reorderedCols = [...tableColumns];

				reorderedCols[selectedColIndex] = tableColumns[targetColIndex];
				reorderedCols[targetColIndex] = tableColumns[selectedColIndex];

				setTableColumns(reorderedCols);

				onColumnOrderChange(reorderedCols);
			}
		},
		[onColumnOrderChange, tableColumns],
	);

	const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	const handleDragEnd = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		sourceColumnId.current = '';

		setDraggingColumn('');
	}, []);

  const handleResizeStart = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const element = e.target as HTMLDivElement;
      const { attributes } = element?.parentNode as HTMLDivElement;
      const id = attributes.getNamedItem('data-column-id')?.value;

      if (id) {
        sourceColumnId.current = tableColumns[findColumnIndexById(tableColumns, id)]?.id?.toString() || '';
        setResizingColumn(sourceColumnId.current);
        setResizingColumnElement(e.target)
      }
    },
    [tableColumns],
  )

  const handleResizeMove = React.useCallback(
    // React.PointerEvent<React.PointerEventHandler<Element>> ! Somehow get type error
    (e: any) => {
        if (resizingColumnId === '' || resizingColumnElement === null) return;
        const id = findColumnIndexById(tableColumns, resizingColumnId)
        const columnElement = (resizingColumnElement as HTMLDivElement)?.parentNode as HTMLDivElement;

        const resizedCols = [...tableColumns]

        let width = e.clientX - Math.trunc(columnElement.getBoundingClientRect().left)

        const minWidth = Number(resizedCols[id]['minWidth']?.replace(/\D/g, ''));
        const maxWidth = Number(resizedCols[id]['maxWidth']?.replace(/\D/g, ''));

        if (minWidth && width < minWidth) {
            width = minWidth
        } else if (maxWidth && width > maxWidth) {
            width = maxWidth
        } else {
            width = Math.max(width, 10)
        }

        resizedCols[id]['width'] = `${width}px`
        setTableColumns(resizedCols)
    },
    [resizingColumnId, tableColumns],
  );

  const handleResizeStop = React.useCallback(
    () => {
      setResizingColumn('');
    },
    [],
	);

	const defaultSortDirection = getSortDirection(defaultSortAsc);
	const defaultSortColumn = React.useMemo(
		() => tableColumns[findColumnIndexById(tableColumns, defaultSortFieldId?.toString())] || {},
		[defaultSortFieldId, tableColumns],
	);

  React.useEffect(
		() => {
			if (resizingColumnId !== '') {
				window.addEventListener('pointermove', handleResizeMove);
				window.addEventListener('pointerup', handleResizeStop);
			}

			return () => {
				window.removeEventListener('pointermove', handleResizeMove);
				window.removeEventListener('pointerup', handleResizeStop);
			}
		},
		[resizingColumnId]
	)

	const setColumnOffset = (columnOffset: number, columnId: string | number): void => {
		const id = findColumnIndexById(tableColumns, columnId.toString())
		const offsetCols = [...tableColumns]
		offsetCols[id]['leftOffset'] = `${columnOffset}px`
		setTableColumns(offsetCols)
	}

	return {
		tableColumns,
		draggingColumnId,
		handleDragStart,
		handleDragEnter,
		handleDragOver,
		handleDragLeave,
		handleDragEnd,
		defaultSortDirection,
		defaultSortColumn,
        resizingColumnId,
        handleResizeStart,
        setColumnOffset,
	};
}

export default useColumns;
