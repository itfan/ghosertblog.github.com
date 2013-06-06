new function($) {
  $.fn.setCursorPosition = function(pos) {
    if ($(this).get(0).setSelectionRange) {
      $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
      var range = $(this).get(0).createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
    $(this).focus();
  }
}(jQuery);

(function () {
    var markdownBriefIntroduction = 
    '# Markdown 语法简明手册\n\n### 1. 使用 * 和 ** 表示斜体和粗体\n\n示例：\n\n这是 *斜体*，这是 **粗体**。\n\n### 2. 使用 === 表示一级标题，使用 --- 表示二级标题\n\n示例：\n\n' +
    '这是一个一级标题\n============================\n\n这是一个二级标题\n--------------------------------------------------\n\n### 这是一个三级标题\n\n' + 
    '你也可以选择在行首加井号表示不同级别的标题，例如：# H1, ## H2, ### H3。\n\n### 3. 使用 \\[描述](链接地址) 为文字增加外链接\n\n' +
    '示例：\n\n这是去往 [本人博客](http://ghosertblog.github.com) 的链接。\n\n### 4. 在行末加两个空格表示换行\n\n示例：\n\n第一行(此行最右有两个看不见的空格)  \n' +
    '第二行\n\n### 5. 使用 *，+，- 表示无序列表\n\n示例：\n\n- 无序列表项 一\n- 无序列表项 二\n- 无序列表项 三\n\n### 6. 使用数字和点表示有序列表\n\n' +
    '示例：\n\n1. 有序列表项 一\n2. 有序列表项 二\n3. 有序列表项 三\n\n### 7. 使用 > 表示文字引用\n\n示例：\n\n> 野火烧不尽，春风吹又生\n\n### 8. 使用 \\`代码` 表示行内代码块\n\n' +
    '示例：\n\n让我们聊聊 `html`\n\n### 9.  使用 四个缩进空格 表示代码块\n\n示例：\n\n    这是一个代码块，此行左侧有四个不可见的空格\n\n### 10.  使用 \\!\\[描述](图片链接地址) 插入图像' +
    '\n\n示例：\n\n![我的头像](http://tp3.sinaimg.cn/2204681022/180/5606968568/1)';

    if (window.isMarkdownHelpPage) { // markdown help page is loading the certain text, regardless of local storage.
        article = '`此页面为沙箱页面，您的任何修改不会被保存`\n\n' + markdownBriefIntroduction;
    } else {
        var article = $.localStorage('article');
        if (!article) {
            article = markdownBriefIntroduction;
        }
    }

    var converter1 = Markdown.getSanitizingConverter();

    var help = function () {
        var w = window.open(window.location);
        w.isMarkdownHelpPage = true;
    }
    var options = {
        helpButton: { handler: help },
        strings: Markdown.local.zh
    };

    var editor1 = new Markdown.Editor(converter1, null, options);

    var scrollLink = getScrollLink(); 
    scrollLink.onLayoutCreated();
    editor1.hooks.chain("onPreviewRefresh", function () {
        scrollLink.onPreviewFinished();
        if (!window.isMarkdownHelpPage) { // Editing on markdown help page won't change local storage
            var preSaveArticle = $('#wmd-input').val();
            var savedArticle = $.localStorage('article');
            if (preSaveArticle != savedArticle) {
                $.localStorage('article', preSaveArticle);
            }
        }
    });
    scrollLink.onEditorConfigure(editor1);

    function popupEditorDialog(title, body, imageClass, placeholder) {
        $('#editorDialog').find('.modal-body input').val("");
        $('#editorDialog').find('.modal-body input').attr("placeholder", placeholder);
        $('#editorDialog').find('#editorDialog-title').text(title);
        $('#editorDialog').find('.modal-body p').text(body);
        $('#editorDialog').find('.modal-body i').removeClass().addClass(imageClass);
        $('#editorDialog').modal({keyboard : true});
    }

    // Custom insert link dialog
    editor1.hooks.set("insertLinkDialog", function(callback) {
        popupEditorDialog('链接', '请输入链接地址', 'icon-link icon-2x', 'http://example.com/ "可选标题"');
        editorDialogCallback = callback;
        return true; // tell the editor that we'll take care of getting the link url
    });

    // Custom insert image dialog
    var editorDialogCallback = null;
    editor1.hooks.set("insertImageDialog", function(callback) {
        popupEditorDialog('图片', '请输入图片地址', 'icon-picture icon-2x', 'http://example.com/images/diagram.jpg "可选标题"');
        editorDialogCallback = callback;
        return true; // tell the editor that we'll take care of getting the image url
    });

    $('#editorDialog').on('hidden', function(){
        if (editorDialogCallback) {
            var url = $('#editorDialog-confirm').data('url');
            if (url) {
                $('#editorDialog-confirm').removeData('url');
                editorDialogCallback(url);
            } else {
                editorDialogCallback(null);
            }
        }
    });

    $('#editorDialog-confirm').click(function(event) {
        var url = $('#editorDialog').find('.modal-body input').val();
        if (url) {
            $(this).data('url', url);
        }
        $('#editorDialog').modal('hide');
    });

    $('#editorDialog').on('shown', function(){
        $('#editorDialog').find('.modal-body input').focus();
    });

    editor1.run();

    // To make sure there is no overflow(scroll bar) on the whole page.
    function calculateEditorPreviewHeight() {
        var height = $(window).height() - $('#wmd-preview').position().top - 20;
        $('#wmd-input').height(height);
        $('#wmd-preview').height(height);
    }
    calculateEditorPreviewHeight();
    $(window).resize(function() {
        calculateEditorPreviewHeight();
    });


    // Populate editor value
    $('#wmd-input').val(article);
    $('#wmd-input').setCursorPosition(0);
    editor1.refreshPreview();


    // Load awesome font to button
    $('#wmd-bold-button > span').addClass('icon-bold muted');
    $('#wmd-italic-button > span').addClass('icon-italic muted');
    $('#wmd-link-button > span').addClass('icon-link muted');
    $('#wmd-quote-button > span').addClass('icon-quote-left muted');
    $('#wmd-code-button > span').addClass('icon-code muted');
    $('#wmd-image-button > span').addClass('icon-picture muted');
    $('#wmd-olist-button > span').addClass('icon-list-ol muted');
    $('#wmd-ulist-button > span').addClass('icon-list-ul muted');
    $('#wmd-heading-button > span').addClass('icon-list-alt muted');
    $('#wmd-hr-button > span').addClass('icon-minus muted');
    $('#wmd-undo-button > span').addClass('icon-undo muted');
    $('#wmd-redo-button > span').addClass('icon-repeat muted');
    $('#wmd-help-button > span').addClass('icon-question-sign muted');


    // create additional new buttons.
    $('#wmd-help-button').before('<li id="wmd-new-button" class="wmd-button" title="新建文件"><span class="icon-file muted"></span></li>');
    $('#wmd-new-button').css('margin-left', '50px');
    $('#wmd-help-button').css('margin-left', '50px');

    $('#wmd-new-button').on('click', function() {
        $('#wmd-input').val('\n\n\n> *使用 [Cmd](http://ghosertblog.github.io/mdeditor/ "中文在线 Markdown 编辑器") 编写*');
        $('#wmd-input').setCursorPosition(0);
        editor1.refreshPreview();
    });


    // change color when hovering.
    $('.wmd-button-row').hover(function() {
        $('.wmd-button span').animate({color: '#2C3E50'}, 400);
    },
    function() {
        $('.wmd-button span').animate({color: '#999999'}, 400);
    }
    );

    // enlarge the icon when hovering.
    $('.wmd-button > span').hover(function() {
        $(this).addClass('icon-large');
    },
    function() {
        $(this).removeClass('icon-large');
    }
    );
})();
