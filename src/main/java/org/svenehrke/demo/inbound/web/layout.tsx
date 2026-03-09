import type {Child} from 'hono/jsx'

export const Layout = ({ children }: { children: Child }) => (
	<html>
	<head>
		<script src="http://localhost:35729/livereload.js"></script>
		<link rel="stylesheet" href="/css/main.css"/>
	</head>
	<body>
	{children}
	</body>
	</html>
)
