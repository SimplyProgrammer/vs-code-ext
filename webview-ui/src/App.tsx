import { useState, useCallback } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { vscode } from './app@vscode/api';

import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

function App() {
	// const [count, setCount] = useState(0)

	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);
	
	const onNodesChange = useCallback(
		(changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback(
		(params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
		[],
	);
	
	return (
		<div style={{ width: '100vw', height: '100vh' }}>
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			fitView
		/>
		</div>
	);

	function handleHowdyClick() {
		vscode.postMessage({
			command: "hello",
			text: "Hey there partner!",
		});
	}

	// return (
	// 	<>
	// 		<div className='bg-amber-50'>
	// 			<h1 className="text-3xl font-bold underline">
	// 				Hello world!
	// 			</h1>
	// 			<VSCodeButton onClick={handleHowdyClick}>
	// 				Click to test
	// 			</VSCodeButton>
	// 		</div>
	// 	</>
	// )
}

export default App
