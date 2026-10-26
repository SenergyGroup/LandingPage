// Shared geometry for mouse, touch, keyboard, restored layouts, and resizing.
export function makeIconGrid(width,height,count){
  const stepX=width<=640?96:88,stepY=100,originX=8,originY=16;
  const columns=Math.max(1,Math.floor((width-originX-78)/stepX)+1);
  // Short screens get a scrollable icon surface rather than overlapping icons.
  const rows=Math.max(1,Math.floor((height-originY-86)/stepY)+1,Math.ceil(count/columns));
  return {columns,rows,stepX,stepY,originX,originY};
}
export const cellKey=cell=>`${cell.col}:${cell.row}`;
export const cellPoint=(cell,grid)=>({x:grid.originX+cell.col*grid.stepX,y:grid.originY+cell.row*grid.stepY});
export function nearestFreeCell(point,occupied,grid){
  let best=null,distance=Infinity;
  for(let row=0;row<grid.rows;row++)for(let col=0;col<grid.columns;col++){
    const cell={col,row};if(occupied.has(cellKey(cell)))continue;
    const p=cellPoint(cell,grid),d=(p.x-point.x)**2+(p.y-point.y)**2;
    if(d<distance){best=cell;distance=d;}
  }
  return best;
}
export function arrangeIcons(ids,saved,grid,preferredColumns){
  const placed={},occupied=new Set(),columns=Math.min(preferredColumns,grid.columns);
  ids.forEach((id,index)=>{
    const candidate=saved[id];
    const fallback={col:index%columns,row:Math.floor(index/columns)};
    const desired=candidate&&Number.isFinite(candidate.col)&&Number.isFinite(candidate.row)?candidate:fallback;
    const cell=nearestFreeCell(cellPoint(desired,grid),occupied,grid);
    placed[id]=cell;occupied.add(cellKey(cell));
  });
  return placed;
}
