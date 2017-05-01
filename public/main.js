(function() {
  if (navigator.userAgent.indexOf('Safari') != -1
    && navigator.userAgent.indexOf('Chrome') == -1) {
      alert('Safari 目前不支持直接复制链接，请手动复制链接或换浏览器');
  }
  // 'This is a {0} {1} function'.format('string', 'format')
  // ==> 'This is a string format function'
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
      });
    };
  }

  // Constant
  var previewTemplate ='\
        <div class="col s6 m4 l2">\
        <div class="card hoverable">\
            <div class="card-image">\
                <img class="modal-trigger" href="#preview-modal" src="{4}" {3}>\
            </div>\
            <div class="u-filename">\
                {5}\
            </div>\
            <div class="card-action">\
                <a style="margin-right: 8px;" class="copy-btn" data-clipboard-text=\'{0}\'>复制</a>\
                <a style="margin-right: 8px;" class="copy-btn" href="{0}" target="_blank">打开</a>\
                <i class="right fa fa-trash fa-lg getlink-remove"></i>\
            </div>\
        </div>\
    </div>\
    ';

  // Settings localStorage methods
  var GL = {
    get: function(k) {
      var val = localStorage.getItem('getlink_' + k);
      if (val === 'true') {
        return true;
      }
      if (val === 'false') {
        return false;
      }
      return val;
    },
    set: function(k, v) {
      localStorage.setItem('getlink_' + k, v);
    },
    addFile: function(file) {
      var files = JSON.parse(localStorage.getItem('getlink_files')) || [];
      files.unshift(file);
      localStorage.setItem('getlink_files', JSON.stringify(files));
    },
    getFiles: function() {
      return JSON.parse(localStorage.getItem('getlink_files')) || [];
    },
    removeFile: function(url) {
      var files = JSON.parse(localStorage.getItem('getlink_files')) || [];
      var idx = -1;
      files.forEach(function(file, i) {
        if (file.url === url) {
          idx = i;
        }
      });
      files.splice(idx, 1);
      localStorage.setItem('getlink_files', JSON.stringify(files));
      return files;
    },
    removeAllFiles: function() {
      localStorage.setItem('getlink_files', '[]');
    }
  };
  var prevewIcons = {
    doc: 'https://haitao.nos.netease.com/3f31f6b9baa147fda7ab44e48a4fe0d6.png',
    ppt: 'https://haitao.nos.netease.com/6a2be951849b47df89dd85cf5c5a425d.png',
    xls: 'https://haitao.nos.netease.com/5a99e61b5b7b4a3cb13f6ea7bc1848c0.png',
    pdf: 'https://haitao.nos.netease.com/d82c8d50c9bf4485aa08be2f28b85964.png',
    txt: 'https://haitao.nos.netease.com/c44ed8893cc240d584b06c1615ae8a93.png',
    none: 'https://haitao.nos.netease.com/b743cd6c7e8841088fd197dc3843f64a.png'
  };
  var office365 = 'https://view.officeapps.live.com/op/embed.aspx?src=';

  var getFileUrl = function(url) {
    if (/\.(gif|jpe?g|tiff|png|bmp|ico)$/.test(url.toLowerCase())) {
      return url;
    }
    if (/\.docx?$/.test(url)) {
      return prevewIcons.doc;
    }
    if (/\.pptx?$/.test(url)) {
      return prevewIcons.ppt;
    }
    if (/\.xlsx?$/.test(url)) {
      return prevewIcons.xls;
    }
    if (/\.pdf$/.test(url)) {
      return prevewIcons.pdf;
    }
    if (/\.txt$/.test(url)) {
      return prevewIcons.txt;
    }
    return prevewIcons.none;
  };

  var handlePreview = function() {
    var hasItems = false;
    $('.modal-trigger').each(function() {
      hasItems = true;
      var url = $(this).parents('.card').find('.copy-btn').attr('data-clipboard-text');
      if (/\.(doc|ppt|xls)x?$/.test(url.toLowerCase())) {
        $(this).leanModal({
          ready: function() {
            $('#preview-modal iframe').attr('src', office365 + url);
          },
          complete: function() {
            $('#preview-modal iframe').attr('src', 'about:blank');
          }
        });
      } else if (/\.(pdf|txt)$/.test(url.toLowerCase())) {
        $(this).leanModal({
          ready: function() {
            $('#preview-modal iframe').attr('src', url);
          },
          complete: function() {
            $('#preview-modal iframe').attr('src', 'about:blank');
          }
        });
      } else if (/\.(gif|jpe?g|tiff|png|bmp|ico)$/.test(url.toLowerCase())) {
        $(this).materialbox();
      }
    });
    if (hasItems) {
      $('.u-tips').hide();
    } else {
      $('.u-tips').show();
    }
  };

  var reloadGallery = function() {
    $('.getlink-remove-all').hide();
    $('.card').parent().remove();
    GL.getFiles().forEach(function(file) {
      var preview = previewTemplate.format(
        file.url,
        '<img src="' + file.url + '">',
        '![](' + file.url + ')',
        '',
        getFileUrl(file.url),
        file.name
      );
      $('#getlink_preview').append(preview);
      $('.getlink-remove-all').show();
    });
    handlePreview();
  };

  $('body').on('click', '.getlink-remove', function() {
    $(this).parents('.card').parent().remove();
    var files = GL.removeFile($(this).parents('.card').find('img').attr('src'));
    if (files.length === 0) {
      $('.u-tips').show();
      $('.getlink-remove-all').hide();
    }
  });

  $('.getlink-remove-all').click(function() {
    $('.card').parent().remove();
    $(this).hide();
    $('.u-tips').show();
    GL.removeAllFiles();
  });

  // Dropzone settings
  Dropzone.options.myAwesomeDropzone = {
    paramName: 'fileData',
    addRemoveLinks: true,
    init: function() {
      var param = this.params;
      var self = this;
      this.on('success', function(file, response) {
        var fileUrl = response.url;
        var fileName = response.name;
        var preview = previewTemplate.format(
          fileUrl,
          '<img src="' + fileUrl + '">',
          '![](' + fileUrl + ')',
          '',
          getFileUrl(fileUrl),
          fileName
        );
        $('#getlink_preview').prepend(preview);
        $('.getlink-remove-all').show();
        GL.addFile({
          url: fileUrl,
          name: fileName
        });
        handlePreview();
        self.removeFile(file);
      });
    }
  };

  // Modal & SideNav init
  $(".button-collapse").sideNav();

  // ClipBoard
  var clipboard = new Clipboard('.copy-btn');
  clipboard.on('success', function(e) {
    Materialize.toast('链接已复制到剪贴板', 2000);
  });

  // Let's Rock!
  reloadGallery();
}());
