let graph = { 
  A:{B:4,C:2}, 
  B:{A:4,C:1,D:5}, 
  C:{A:2,B:1,D:8,E:10}, 
  D:{B:5,C:8,E:2,Z:6}, 
  E:{C:10,D:2,Z:3}, 
  Z:{D:6,E:3} 
};
let nodes = Object.keys(graph);
const startSelect = document.getElementById('start');
const endSelect = document.getElementById('end');
const resultDiv = document.getElementById('result');
const algoSelect = document.getElementById('algo');

function refreshSelects(){
  startSelect.innerHTML=""; 
  endSelect.innerHTML="";
  nodes.forEach(n=>{
    startSelect.innerHTML+=`<option value="${n}">${n}</option>`;
    endSelect.innerHTML+=`<option value="${n}">${n}</option>`;
  });
}

// Dijkstra Algorithm
function dijkstra(start){
  const distances={},previous={};
  nodes.forEach(n=>{ distances[n]=Infinity; previous[n]=null; });
  distances[start]=0; const pq=[[0,start]];
  while(pq.length){
    pq.sort((a,b)=>a[0]-b[0]);
    const [dist,node]=pq.shift();
    if(dist>distances[node]) continue;
    for(const neigh in graph[node]){
      const nd = dist + graph[node][neigh];
      if(nd<distances[neigh]){ 
        distances[neigh]=nd; 
        previous[neigh]=node; 
        pq.push([nd,neigh]); 
      }
    }
  }
  return {distances,previous};
}

// BFS Algorithm
function bfs(start){
  const dist={},prev={};
  nodes.forEach(n=>{ dist[n]=Infinity; prev[n]=null; });
  dist[start]=0; const q=[start];
  while(q.length){
    const u=q.shift();
    for(const v in graph[u]){
      if(dist[v]===Infinity){ 
        dist[v]=dist[u]+1; 
        prev[v]=u; 
        q.push(v); 
      }
    }
  }
  return {distances:dist,previous:prev};
}

// DFS Algorithm (stops at target)
function dfs(start,target){
  const visited = {};
  const prev = {};
  let found = false;

  nodes.forEach(n => { visited[n] = false; prev[n] = null; });

  function explore(u){
    if(found) return;
    visited[u] = true;
    if(u === target){ found = true; return; }
    for(const v in graph[u]){
      if(!visited[v]){
        prev[v] = u;
        explore(v);
      }
    }
  }
  explore(start);
  return {previous:prev, found};
}

// Shortest path reconstruction
function shortestPath(previous,start,target){
  const path=[]; let cur=target;
  while(cur!==null){ path.push(cur); cur=previous[cur]; }
  return path.reverse();
}

// Visualization
let network;
function drawGraph(path=[]){
  const visNodes=nodes.map(n=>({id:n,label:n,color:{background:"#2575fc",border:"#fff"},font:{color:"white"}}));
  const visEdges=[];
  for(const a in graph){
    for(const b in graph[a]){
      if(a<b) visEdges.push({from:a,to:b,label:graph[a][b].toString(),color:{color:'gray'},width:1});
    }
  }
  if(path.length>1){
    for(let i=0;i<path.length-1;i++){
      const u=path[i],v=path[i+1];
      const edge=visEdges.find(e=>(e.from===u&&e.to===v)||(e.from===v&&e.to===u));
      if(edge){ edge.color={color:'red'}; edge.width=3; }
    }
  }
  const data={nodes:new vis.DataSet(visNodes), edges:new vis.DataSet(visEdges)};
  const options={physics:{enabled:true}, edges:{smooth:false}, nodes:{shape:"dot", size:25}};
  network=new vis.Network(document.getElementById('mynetwork'),data,options);
  refreshSelects();
}

// Event Listeners
document.getElementById('runBtn').addEventListener('click',()=>{
  const start=startSelect.value,end=endSelect.value,algo=algoSelect.value;
  let result;

  if(algo==="dijkstra") result = dijkstra(start);
  else if(algo==="bfs") result = bfs(start);
  else if(algo==="dfs") result = dfs(start,end);

  if(algo==="dfs"){
    if(!result.found){
      resultDiv.innerText=` No path found with DFS from ${start} → ${end}`;
      drawGraph([]);
    } else {
      const path=shortestPath(result.previous,start,end);
      resultDiv.innerText=`DFS path ${start} → ${end}: ${path.join(' → ')} (Edges: ${path.length-1})`;
      drawGraph(path);
    }
  }else{
    if(result.distances[end]===Infinity){
      resultDiv.innerText=` No path from ${start} → ${end}`;
      drawGraph([]);
    }else{
      const path=shortestPath(result.previous,start,end);
      resultDiv.innerText=`${algo.toUpperCase()} path ${start} → ${end}: ${path.join(' → ')} (Distance: ${result.distances[end]})`;
      drawGraph(path);
    }
  }
});

document.getElementById('resetBtn').addEventListener('click',()=>{
  graph = { 
    A:{B:4,C:2}, 
    B:{A:4,C:1,D:5}, 
    C:{A:2,B:1,D:8,E:10}, 
    D:{B:5,C:8,E:2,Z:6}, 
    E:{C:10,D:2,Z:3}, 
    Z:{D:6,E:3} 
  };
  nodes = Object.keys(graph);
  drawGraph();
  resultDiv.innerText="Graph reset!";
});

document.getElementById('addNodeBtn').addEventListener('click',()=>{
  const newNode=document.getElementById('newNode').value.trim();
  if(newNode && !graph[newNode]){ graph[newNode]={}; nodes=Object.keys(graph); drawGraph(); }
});

document.getElementById('addEdgeBtn').addEventListener('click',()=>{
  const from=document.getElementById('edgeFrom').value.trim();
  const to=document.getElementById('edgeTo').value.trim();
  const weight=parseInt(document.getElementById('edgeWeight').value);
  if(from && to && weight && graph[from] && graph[to]){ graph[from][to]=weight; graph[to][from]=weight; drawGraph(); }
});

// Initial Draw
drawGraph();
