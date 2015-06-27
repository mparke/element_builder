(function(window, Array, document) {
  var slice = Array.prototype.slice;

  function createTreeNode() {
    return { children: [], parent: null, element: null };
  }

  // borrowed from underscore
  function compose() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) {
        result = args[i].call(this, result);
      }
      return result;
    };
  }

  function extend() {      
    var args = slice.call(arguments);

    if (args.length < 2) {
      throw new Error('Extend must have at least 2 objects as arguments.');
    }

    return args.reduce(function (previous, current, index, arr) {
      for (var index in current) {
        previous[index] = current[index];
      }
      return previous;
    });
  }
  
  function chain(root) {
    return component(root);
  }

  function component(root) {
    root = root || createTreeNode();

    // TODO: pull out of comp after todo below is done
    // TODO: make this return an array ( including root, so it doesn't have to be redefined )
    function addToElements(data) {
      // console.log('pushing', data);
      var treeNode = createTreeNode();
      treeNode.element = data;
      treeNode.parent = root;
      root.children.push(treeNode);
      return root;
    }

    function element(name) {
      return compose(chain, addToElements, function(attributes) {
        return { 
          name: name,
          dataKey: null,
          queryKey: null,
          attributes: attributes || {}
        };
      });  
    }

    function getLastChildNode() {
      return root.children[root.children.length - 1];
    }

    function getLastChildNodeElement() {
      return getLastChildNode().element;
    }

    function getLastChildNodeElementAttributes() {
      return getLastChildNodeElement().attributes;
    }

    // tree creation
    function children() {
      return component(getLastChildNode());
    }

    // go back up a level
    function end() {
      if (!root.parent) {
        return component(root);
      }
      return component(root.parent);
    }

    // find root should not disturb the state of the current component() call
    function getTreeRoot(root) {
      var treeRoot = root;
      while (treeRoot.parent !== null) {
        treeRoot = treeRoot.parent;
      }
      return treeRoot;
    }

    function renderElement(node) {
      var elementDefiniton = node.element;
      var name = elementDefiniton.name;
      var attributes = elementDefiniton.attributes;
      var element = document.createElement(name);
      extend(element, attributes);
      return element;
    }

    // depth first rendering of nodes
    function renderFromNode(node) {
      // the root will not have an element right now
      var documentFragment = document.createDocumentFragment();
      var length = node.children.length;
      var i = 0;
      var childNode;
      var element;

      while (i < length) {
        childNode = node.children[i];
        element = renderElement(childNode);
        
        if (childNode.children.length) {
          element.appendChild(renderFromNode(childNode));
        }

        documentFragment.appendChild(element);
        i++;
      }

      return documentFragment;
    }

    function render() {
      return renderFromNode(getTreeRoot(root));
    }

    // order of elements defined by:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element
    // content sectioning
    var domElements = {
      address: element('address'),
      article: element('article'),
      // body skipped - 1 per doc
      footer: element('footer'),
      header: element('header'),
      h1: element('h1'),
      h2: element('h2'),
      h3: element('h3'),
      h4: element('h4'),
      h5: element('h5'),
      h6: element('h6'),
      hgroup: element('hgroup'),
      nav: element('nav'),
      section: element('section'),
      // text content
      dd: element('dd'),
      div: element('div'),
      dl: element('dl'),
      dt: element('dt'),
      figcaption: element('figcaption'),
      figure: element('figure'),
      hr: element('hr'),
      li: element('li'),
      main: element('main'),
      ol: element('ol'),
      p: element('p'),
      pre: element('pre'),
      ul: element('ul'),
      // inline text semantics
      a: element('a'),
      abbr: element('abbr'),
      b: element('b'),
      bdi: element('bdi'),
      bdo: element('bdo'),
      br: element('br'),
      cite: element('cite'),
      code: element('code'),
      data: element('data'),
      dfn: element('dfn'),
      em: element('em'),
      i: element('i'),
      kbd: element('kbd'),
      mark: element('mark'),
      q: element('q'),
      rp: element('rp'),
      rt: element('rt'),
      rtc: element('rtc'),
      ruby: element('ruby'),
      s: element('s'),
      samp: element('samp'),
      small: element('small'),
      span: element('span'),
      strong: element('strong'),
      sub: element('sub'),
      sup: element('sup'),
      time: element('time'),
      u: element('u'),
      var: element('var'),
      wbr: element('wbr'),
      // image and multimedia
      area: element('area'),
      audio: element('audio'),
      img: element('img'),
      map: element('map'),
      track: element('track'),
      video: element('video'),
      // embedded content
      embed: element('embed'),
      iframe: element('iframe'),
      object: element('object'),
      param: element('param'),
      source: element('source'),
      // scripting
      canvas: element('canvas'),
      noscript: element('noscript'),
      script: element('script'),
      // edits
      del: element('del'),
      ins: element('ins'),
      // table content
      caption: element('caption'),
      col: element('col'),
      colgroup: element('colgroup'),
      table: element('table'),
      tbody: element('tbody'),
      td: element('td'),
      tfoot: element('tfoot'),
      th: element('th'),
      thead: element('thead'),
      tr: element('tr'),
      //forms
      button: element('button'),
      datalist: element('datalist'),
      fieldset: element('fieldset'),
      form: element('form'),
      input: element('input'),
      keygen: element('keygen'),
      label: element('label'),
      legend: element('legend'),
      meter: element('meter'),
      optgroup: element('optgroup'),
      option: element('option'),
      output: element('output'),
      progress: element('progress'),
      select: element('select'),
      textarea: element('textarea'),
      // interactive element
      details: element('details'),
      dialog: element('dialog'),
      menu: element('menu'),
      menuitem: element('menuitem'),
      summary: element('summary')
      // web components
      // content
      // element
      // shadow
      // template
    };

    // generic attribute setter
    var attr = compose(chain, function(key, value) {
      getLastChildNodeElementAttributes()[key] = value;
      return root;
    });
    // specific attribute setters
    // TODO: may be able to compose with attr
    var id = compose(chain, function(idString) {
      getLastChildNodeElementAttributes().id = idString;
      return root
    });

    var className = compose(chain, function(classNameString) {
      getLastChildNodeElementAttributes().className = classNameString;
      return root;
    });

    var text = compose(chain, function(textString) {
      getLastChildNodeElementAttributes().textContent = textString;
      return root;
    });

    var dataKey = compose(chain, function(dataKeyString) {
      getLastChildNode().dataKey = dataKeyString;
      return root;
    });

    var queryKey = compose(chain, function(queryKeyString) {
      getLastChildNode().queryKey = queryKeyString;
      return root;
    });

    return extend({}, domElements, {
      attr: attr,
      id: id,
      className: className,
      text: text,
      dataKey: dataKey,
      queryKey: queryKey,
      children: children,
      end: end,
      render: render
    });
  }

  window.component = component;
  // usage:
  // comp().div().div().children(comp().div().div());
})(window, Array, document);
