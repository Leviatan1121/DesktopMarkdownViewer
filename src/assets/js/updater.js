const { BundleType, getBundleType } = window.__TAURI__.app;
getBundleType().then(bundleType => {
    if (!Object.values(BundleType).includes(bundleType)) {
        console.warn('Running development build, skipping update check...');
        return;
    }
    window.__TAURI__.updater.check().then(async (update) => {
        if (!update) return;
        await update.downloadAndInstall().then(async () => {
            await window.__TAURI__.process.relaunch();
        }).catch(error =>
            console.error('Error relaunching application:', error)
        );
    });
});