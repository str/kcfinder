/** This file is part of KCFinder project
  *
  *      @desc Upload files using drag and drop
  *   @package KCFinder
  *   @version 3.12
  *    @author Forum user (updated by Pavel Tzonkov)
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.initDropUpload = function() {
    var files = $('#files'),
        folders = $('#folders').find('div.folder > a'),
        i, dlg, filesSize, uploaded, errors,

    precheck = function(e) {
        filesSize = uploaded = 0; errors = [];

        dlg = _.dialog(_.label("Uploading files"), '<div class="info count">&nbsp;</div><div class="bar count"></div><div class="info size">&nbsp</div><div class="bar size"></div><div class="info errors">&nbsp;</div>', {
            buttons: []
        });

        dlg.parent().css('padding-bottom', 0).find('.ui-dialog-titlebar button').css('visibility', 'hidden').get(0).disabled = true;

        var fs = e.dataTransfer.files;
        for (i = 0; i < fs.length; i++)
            filesSize += fs[i].size;

        dlg.find('.bar.count').progressbar({max: fs.length, value: 0});
        dlg.find('.bar.size').progressbar({max: filesSize, value: 0});

        return true;
    },

    options = {
        param: "upload[]",
        maxFilesize: _.dropUploadMaxFilesize,

        begin: function(xhr, currentFile, count) {

            dlg.find('.info.count').html(_.label("Uploading file {current} of {count}", {
                current: currentFile,
                count: count
            }));

            dlg.find('.info.size').html(_.label("Uploaded {uploaded} of {total}", {
                uploaded: _.humanSize(uploaded),
                total: _.humanSize(filesSize)
            }));

            dlg.find('.info.errors').html(_.label("Errors:") + " " + errors.length);
            dlg.find('.bar.count').progressbar({value: currentFile});
            dlg.find('.bar.size').progressbar({value: uploaded});
            dlg.find('.info').css('padding', "5px 0");
        },

        success: function(xhr, currentFile, count) {
            uploaded += xhr.file.size;
            var response = xhr.responseText;
            if (response.substr(0, 1) != "/")
                errors.push($.$.htmlData(xhr.file.name + ": " + response));
        },

        error: function(xhr, currentFile, count) {
            uploaded += xhr.file.size;
            errors.push($.$.htmlData(xhr.file.name + ": " + _.label("Failed to upload {filename}!", {
                filename: xhr.file.name
            })));
        },

        abort: function(xhr, currentFile, filesCount) {
            uploaded += xhr.file.size;
            errors.push($.$.htmlData(xhr.file.name + ": " + _.label("Failed to upload {filename}!", {
                filename: xhr.file.name
            })));
        },

        filesizeCallback: function(xhr, currentFile, filesCount) {
            uploaded += xhr.file.size;
            errors.push($.$.htmlData(xhr.file.name + ": " + _.label("The uploaded file exceeds {size} bytes.", {
                size: _.dropUploadMaxFilesize
            })));
        },

        finish: function() {
            _.refresh();
            dlg.find('.bar.size').progressbar({value: uploaded});
            dlg.find('.info.size').html(_.label("Uploaded: {uploaded} of {total}", {
                uploaded: _.humanSize(uploaded),
                total: _.humanSize(filesSize)
            }));
            dlg.find('.info.errors').html(_.label("Errors:") + " " + errors.length);
            var err = errors;
            setTimeout(function() {
                dlg.dialog('destroy').detach();
                if (err.length)
                    _.alert(err.join('<br />'));
            }, 500);
        }
    };

    files.shDropUpload($.extend(true, options, {
        url: _.getURL('upload') + "&dir=" + encodeURIComponent(_.dir),
        precheck: function(e) {
            if (!$('#folders span.current').first().parent().data('writable')) {
                _.alert(_.label("Cannot write to upload folder."));
                return false;
            }
            return precheck(e);
        }
    }));

    folders.each(function() {
        var folder = this;
        $(folder).shDropUpload($.extend(true, options, {
            url: _.getURL('upload') + "&dir=" + encodeURIComponent($(folder).data('path')),
            precheck: function(e) {
                if (!$(folder).data('writable')) {
                    _.alert(_.label("Cannot write to upload folder."));
                    return false;
                }
                return precheck(e);
            }
        }));
    });
};
