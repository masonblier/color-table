import React from 'react';

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
              <th>red</th>
              <th>green</th>
              <th>blue</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row) => this.renderRow(row))}
          </tbody>
        </table>
      </div>
    );
  }

  renderRow(row) {
    const background = `#${hexStr(row.r)}${hexStr(row.g)}${hexStr(row.b)}`;
    const color = textColor(row);
    const className = (row.name === this.state.dropTarget) ? 'color-table-drop-before' :
                      (row === this.state.dragRow) ? 'color-table-dragging' : '';
    return (
      <tr className={className} style={{background, color}}
        onDragEnter={(e) => this.handleDragEnter(e, row)}
        onDragLeave={(e) => this.handleDragLeave(e, row)}
        onDrop={(e) => this.handleDrop(e, row)}
        onDragOver={(e) => this.handleDragOver(e)}
        onDragStart={(e) => this.handleDragStart(e, row)}
        onDragEnd={(e) => this.handleDragEnd(e)}
        draggable={true}
      >
        <td className='color-table-actions'>
          <i className='color-table-grip'/>
        </td>
        <td>{row.name}</td>
        <td>{hexStr(row.r)}</td>
        <td>{hexStr(row.g)}</td>
        <td>{hexStr(row.b)}</td>
      </tr>
    );
  }

  handleDragStart(e, dragRow) {
    this.setState({dragRow: dragRow})
  }
  handleDragEnd() {
    this.setState({dragRow: null});
  }

  handleDragEnter(e, dropRow) {
    this.setState({dropTarget: dropRow.name})
  }
  handleDragOver(e) {
    e.preventDefault();
  }
  handleDrop(e, dropRow) {
    e.preventDefault();
    this.swapRows(this.state.dragRow, dropRow);
  }

  swapRows(dragRow, dropRow) {
    let rows = this.state.page.rows;
    const dragIndex = rows.indexOf(dragRow);
    const dropIndex = rows.indexOf(dropRow);
    if (dragIndex === -1 || dropIndex === -1) {
      console.error('drag failed?', dragIndex, dropIndex)
      return;
    }
    rows.splice(dragIndex, 1);
    rows.splice(dropIndex + (dropIndex > dragIndex ? -1 : 0), 0, dragRow);

    let page = this.state.page;
    page.rows = rows;
    this.setState({page, dragRow: null, dropTarget: null});
  }
}
