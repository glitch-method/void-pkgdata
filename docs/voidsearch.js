(function($, w, d) {
    "use strict";

    // Constants
    const apiHost = "https://xq-api.voidlinux.org";
    const maxResults = 5;
    const szByte = 1;
    const szKilobyte = 1024 * szByte;
    const szMegabyte = 1024 * szKilobyte;
    const szGigabyte = 1024 * szMegabyte;

    // Package column fields and headers
    const packageColumns = [
//        "anchor",
        "version",
        "revision",
        "repository",
        "architecture",
        "build_date",
        "build_options",
        "filename_sha256",
        "filename_size",
        "homepage",
		"installed_size",
		"license",
		"maintainer",
		"short_desc",
		"preserve",
		"source_revisions",
		"run_depends",
		"shlib_requires",
		"shlib_provides",
		"conflicts",
		"reverts",
		"replaces",
		"alternatives",
		"conf_files"
    ];

    const packageHeader = {
//		name: "Name",
		version: "Version",
		revision: "Revision",
		repository: "Repository",
		architecture: "Arch",
		build_date: "Latest",
		build_options: "Build",
		filename_sha256: "Hash",
		filename_size: "Size",
		homepage: "Upstream",
		installed_size: "Installed",
		license: "License",
		maintainer: "Maintainer",
		short_desc: "Description",
		preserve: "Preserve",
		source_revisions: "Src Revisions",
		run_depends: "Depends (run-time)",
		shlib_requires: "Depends (shlib)",
		shlib_provides: "Provides (shlib)",
		conflicts: "Conflicts",
		reverts: "Reverts",
		replaces: "Replaces",
		alternatives: "Alternatives",
		conf_files: "Conf files"

    };

    let header;
    let table;
    let archs;
    let query;
    let form;

    let packages = [];

    // Functions
    function init() {
        header = packageCell(packageHeader, "<th>");

        table = $("#voidSearch_result");
        archs = $("#voidSearch_archs");
        query = $("#voidSearch_query");
        form = $("#voidSearch");
        form.submit(packageQuery);

        $.getJSON(uri("/v1/archs"))
            .done((data) => setArchitectures(data.data.sort()));
    }

    function packageQuery(e) {
        e.preventDefault();
        query.addClass("loading");
        const q = query.val().trim();
        $.getJSON(uri("/v1/packages/" + archs.val() + "/" + q))
            .done((data) => {
                packages = data.data || [];
                showPackages(packages, false);
            })
            .always(() => { query.removeClass("loading"); });
    }

    function packageCell(pkg, cellType) {
        cellType = cellType || "<td>";
        let tr = $("<tr>");
        packageColumns.forEach((col) => {
            var cell = $(cellType);
            cell.addClass(col).html(pkg[col] || "");
            tr.append(cell);
        });
        return tr;
    }

    function showPackages(packages, showAll) {
        packages = packages || [];
        const tooMany = !showAll && packages.length > maxResults;
		table.children().remove();
        if (packages.length == 0) {
            return;
        }
        table.append(
			header, packageCell(packages, "<td>")
//packages.map(p =>
//{
//p.anchor = "<a href=\"https://github.com/void-linux/void-packages/tree/master/srcpkgs/"
//+ p.name + "\" target=\"_blank\" title=\"View on GitHub\">" + p.name + "</a>";
//p.filename_size = formatSize(p.filename_size);
//return packageCell(p, "<td>");
//})
        );

        if (tooMany) {
            table.append(tooManyNotice());
        }
    }

    function setArchitectures(archNames) {
        // Get the current value of the select
        const val = archs.val();
        let found = false;
        let seenX86_64 = false;
        archs.children().remove();
        archNames.forEach((arch) => {
            found = found || arch === val;
            seenX86_64 = seenX86_64 || arch === "x86_64";
            const opt = $("<option>");
            opt.val(arch).text(arch);
            archs.append(opt);
        });
        if (!found) {
            // If the current value wasn"t found, prefer x86_64 if it"s in the list.
            val = seenX86_64 ? "x86_64" : archs.children().first().val();
        }
        archs.val(val);
    }

    function uri(path, params) {
        const qs = params ? ("?" + $.param(params)) : "";
        return apiHost + path + qs;
    }

    function formatSize(size) {
        // NOTE: Doesn"t handle negative numbers.
        if (typeof size !== "number") {
            return "";
        }
        if (size < 10000) {
            return (size >> 0) + "B";
        } else if (size < szMegabyte) {
            return (size / szKilobyte >> 0) + "k";
        } else if (size < szGigabyte) {
            return (size / szMegabyte).toFixed() + "M";
        }
        return (size / szGigabyte).toFixed(2).replace(/\.?0+$/, "") + "G";
    }

    function tooManyNotice() {
        let notice = $("<tr>");
        return notice.append(
            $("<td>")
            .addClass("toomany")
            .attr("colspan", packageColumns.length)
            .text("Too many results (over " + maxResults + "). ")
            .append($("<a>").text("Show all.").click(() => showPackages(packages, true)))
        );
    }

    // Start
    init();
}(jQuery, window, document));
