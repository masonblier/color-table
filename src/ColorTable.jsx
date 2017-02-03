import React from 'react';

let keyI = 0;

function hexStr(num) {
  var s = num.toString(16);
  if (s.length === 1) return "0" + s;
  return s;
}
function textColor(row) {
  var avg = (
    row.r +
    (row.g * 1.5) +
    row.b
  ) / 3.0;
  if (avg > 0x77) return 'black';
  return 'white';
}

export default class ColorTable extends React.Component {
  static colors = [
    {name: 'red', r: 0xFF, g: 0x00, b: 0x00},
    {name: 'green', r: 0x00, g: 0xFF, b: 0x00},
    {name: 'blue', r: 0x00, g: 0x00, b: 0xFF},
    {name: 'yellow', r: 0xFF, g: 0xFF, b: 0x00},
    {name: 'black', r: 0x00, g: 0x00, b: 0x00},
    {name: 'orange', r: 0xFF, g: 0xA0, b: 0x00},
    {name: 'indigo', r: 0x70, g: 0x00, b: 0xFF},
    {name: 'cyan', r: 0x00, g: 0xFF, b: 0xFF},
    {name: 'magenta', r: 0xFF, g: 0x00, b: 0xFF},
  ]

  constructor() {
    super();
    this.state = {
      page: {
        rows: ColorTable.colors,
      }
    };
  }

  render() {
    const {page} = this.state;
    return (
      <div className='color-table'>
        <div className='color-table-selection'></div>
        <h1>color-table</h1>
        <table>
          <thead>
            <tr>
              <th className='color-table-actions'></th>
              <th>color name</th>
              <th className='color-table-center'>red</th>
              <th className='color-table-center'>green</th>
              <th className='color-table-center'>blue</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row, index) => this.renderRow(row, index))}
          </tbody>
        </table>
      </div>
    );
  }

  renderRow(row, index) {
    const background = `#${hexStr(row.r)}${hexStr(row.g)}${hexStr(row.b)}`;
    const color = textColor(row);
    const transform = `translate(0, ${row.offset || 0}px)`;
    const className = (index === this.state.dropIndex) ? 'color-table-drop-before' :
                      ((index === (this.state.page.rows.length - 1)) && (this.state.dropIndex === this.state.page.rows.length)) ? 'color-table-drop-after' :
                      (row === this.state.dragRow) ? 'color-table-dragging' : '';
    return (
      <tr className={className} style={{background, color, transform}}
        onDragEnter={(e) => this.handleDragEnter(e, row)}
        onDrag={(e) => this.handleDrag(e, row)}
        // onDragLeave={(e) => this.handleDragLeave(e, row)}
        onDrop={(e) => this.handleDrop(e, row)}
        onDragOver={(e) => this.handleDragOver(e, row, index)}
        onDragStart={(e) => this.handleDragStart(e, row)}
        onDragEnd={(e) => this.handleDragEnd(e)}
        draggable={true}
        ref={(ref) => row.ref = ref}
        key={`${index}-${row.k}`}
      >
        <td className='color-table-actions'>
          <i className='color-table-grip'/>
        </td>
        <td>{row.name}</td>
        <td className='color-table-center'>{hexStr(row.r)}</td>
        <td className='color-table-center'>{hexStr(row.g)}</td>
        <td className='color-table-center'>{hexStr(row.b)}</td>
      </tr>
    );
  }

  handleDragStart(e, dragRow) {
    this.setState({dragRow: dragRow})
  }
  handleDrag(e, dragRow) {
  }
  handleDragEnd() {
    this.setState({dragRow: null});
  }

  handleDragEnter(e, dropRow) {
    // this.setState({dropTarget: dropRow.name})
  }
  handleDragOver(e, dropRow, dropIndex) {
    if (dropRow.ref) {
      var bb = dropRow.ref.getBoundingClientRect();
      var yFromMiddle = (e.clientY - bb.top) - ((bb.bottom - bb.top) / 2.0);
      if (yFromMiddle < 0) {
        this.setState({dropIndex});
      } else {
        this.setState({dropIndex: dropIndex + 1});
      }
    }
    e.preventDefault();
  }
  handleDrop(e, dropRow) {
    e.preventDefault();
    this.swapRows(this.state.dragRow, dropRow);
  }

  swapRows(dragRow) {
    let rows = this.state.page.rows;
    const dragIndex = rows.indexOf(dragRow);
    const dropIndex = this.state.dropIndex;
    const dropRow = rows[dropIndex];
    if (dragIndex === -1 || dropIndex === -1) {
      console.error('drag failed?', dragIndex, dropIndex)
      return;
    }
    rows.splice(dragIndex, 1);
    rows.splice(dropIndex + (dropIndex > dragIndex ? -1 : 0), 0, dragRow);

    if (dragRow.ref) {
      this.animateOffsets(rows, dragRow, dropRow ? dropRow : rows[dropIndex - 1], dragIndex, dropIndex);
    }

    let page = this.state.page;
    page.rows = rows;
    this.setState({page, dragRow: null, dropIndex: null});
  }

  animateOffsets(rows, dragRow, dropRow, dragIndex, dropIndex) {
    if ((dragIndex + 1) === dropIndex) return;

    var bb = dragRow.ref.getBoundingClientRect();
    var dbb = dropRow.ref.getBoundingClientRect();
    var obb = dragRow.ref.parentElement.getBoundingClientRect();
    var borderSpacing = 5;
    var h = (bb.bottom - bb.top) + borderSpacing;

    ++keyI;
    rows.forEach((row, index) => {
      row.k = keyI;
      if (dragIndex < dropIndex) {
        if ((dropIndex - 1) === index) {
          row.offset = -((dbb.top - obb.top) - (bb.top - obb.top) - (h));
        } else if ((dragIndex <= index) && (index < dropIndex)) {
          row.offset = h;
        } else {
          row.offset = 0;
        }
      } else {
        if (dropIndex === index) {
          row.offset = -((dbb.top - obb.top) - (bb.top - obb.top));
        } else if (dragIndex <= index) {
          if (index < (dropIndex + 1)) {
            row.offset = h;
          } else {
            row.offset = -h;
          }
        } else {
          if (index > dropIndex) {
            row.offset = -h;
          } else {
            row.offset = 0;
          }
        }
      }
    });

    setTimeout(() => this.resetOffsets(), 100);
  }

  resetOffsets() {
    this.setState(({page}) => {
      page.rows.forEach((row) => row.offset = 0);
      return page;
    });
  }
}
