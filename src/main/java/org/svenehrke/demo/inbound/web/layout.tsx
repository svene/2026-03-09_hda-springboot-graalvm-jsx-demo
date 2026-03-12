import type {Child} from 'hono/jsx'

export const Layout = ({ children }: { children: Child }) => (
	<html lang="en" x-data="$store.darkMode" x-bind:data-theme="theme">
	<head>
		<meta charSet="UTF-8"/>
		<title>People Admin Application</title>
		<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>"/>
		<link rel="stylesheet" href="/css/bulma.min.css"/>
		<script src="/js/htmx.org/2.0.8/htmx.js"></script>
		<script src="http://localhost:35729/livereload.js"></script>
		<script src="/js/htmx.org/extensions/path-params.js"></script>
		<script src="/js/hyperscript.org/0.9.14/_hyperscript.js"></script>
		<script defer src="/js/main.js"></script>
		<script defer src="/js/alpinejs/3.15.4/cdn.min.js"></script>
		<script src="/js/mount.js" type="module"></script>
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
		<script>
			//htmx.logAll();
		</script>

	</head>
	<body>
	<section class="hero is-link">
		<div class="hero-body">
			<nav class="level">
				<div class="level-left">
					<p class="title">People Admin Application</p>
				</div>
				<div class="level-right">
					<button x-on:click="$store.darkMode.toggle()">
						<span class="icon"><i class="material-icons" x-text="icon"></i></span>
					</button>
				</div>
			</nav>
		</div>
	</section>

	{children}
	</body>
	</html>
)
