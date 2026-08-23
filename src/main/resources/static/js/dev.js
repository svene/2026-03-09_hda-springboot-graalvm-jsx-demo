new EventSource("/dev-reload")
	.addEventListener("reload", () => {
		console.log("Reload triggered");
		location.reload();
	}
);
