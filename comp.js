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
        result = args[i].apply(this, result);
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

  function addToTree(root, data) {
    // console.log('pushing', data);
    var treeNode = createTreeNode();
    treeNode.data = data;
    treeNode.parent = root;
    root.children.push(treeNode);
    return [root, null]; // always in pairs for consistency
  }

  function isComponent(arg) {
    // if (typeof arg === 'function' && arg.name === 'component') {
    //   return true;
    // }
    if (arg && arg._component) {
      return true;
    }
    return false;
  }
  
  // function isObject(arg) {
  //   return (typeof arg === 'object');
  // }

  function element(root, name) {
    return compose(chain, addToTree, function(arg) {
      // attributes object
      // component function
      // detect the type of arg, it is either a tree node or a component function
      if (isComponent(arg)) {
        return [root, arg];
      }

      // assume isObject for now
      return [root, {
        name: name,
        dataKey: null,
        queryKey: null,
        attributes: {} // TODO: figure out how to pass attributes when arg is the returned object from component()
      }];
    });
  }

  function getLastChildNode(node) {
    return node.children[node.children.length - 1];
  }

  function getLastChildNodeElement(node) {
    return getLastChildNode(node).element;
  }

  function getLastChildNodeElementAttributes(node) {
    return getLastChildNodeElement(node).attributes;
  }

  // find root should not disturb the state of the current component() call
  function getTreeRoot(root) {
    var treeRoot = root;
    while (treeRoot.parent !== null) {
      treeRoot = treeRoot.parent;
    }
    return treeRoot;
  }

  function renderNode(node) {
    var elementDefiniton = node.data;
    var name = elementDefiniton.name;
    var attributes = elementDefiniton.attributes;
    var element = document.createElement(name);
    extend(element, attributes);
    return element;
  }

  // depth first rendering of nodes
  function renderFromNode(node) {
    // the root will not have an element right now
    // var documentFragment = document.createDocumentFragment();
    var elements = [];
    var length = node.children.length;
    var i = 0;
    var childNode;
    var element;

    while (i < length) {
      childNode = node.children[i];

      if (isComponent(childNode.data)) {
        // render the component
        elements.push(childNode.data.render(true)[0]); // partial render
        // documentFragment.appendChild(childNode.data.render());  
      } else {
        element = renderNode(childNode);
        if (childNode.children.length) {
          element.appendChild(renderFromNode(childNode));
        }
        // documentFragment.appendChild(element);
        elements.push(element);
      }

      i++;
    }

    // return documentFragment;
    return elements;
  }

  function createFragment(elements) {
    var documentFragment = document.createDocumentFragment();
    var length = elements.length;
    
    for(var i = 0; i < length; i++) {
      documentFragment.appendChild(elements[i]);
    }
    return documentFragment;
  }

  function component(root) {
    root = root || createTreeNode();


    // // tree creation
    // function children() {
    //   return component(getLastChildNode(node));
    // }

    // go back up a level
    function end() {
      if (!root.parent) {
        return component(root);
      }
      return component(root.parent);
    }

    function render(partialRender) {
      if (!partialRender) {
        return createFragment(renderFromNode(getTreeRoot(root)));
      }

      return renderFromNode(getTreeRoot(root));
    }

    // order of elements defined by:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element
    // content sectioning
    var domElements = {
      address: element(root, 'address'),
      article: element(root, 'article'),
      // body skipped - 1 per doc
      footer: element(root, 'footer'),
      header: element(root, 'header'),
      h1: element(root, 'h1'),
      h2: element(root, 'h2'),
      h3: element(root, 'h3'),
      h4: element(root, 'h4'),
      h5: element(root, 'h5'),
      h6: element(root, 'h6'),
      hgroup: element(root, 'hgroup'),
      nav: element(root, 'nav'),
      section: element(root, 'section'),
      // text content
      dd: element(root, 'dd'),
      div: element(root, 'div'),
      dl: element(root, 'dl'),
      dt: element(root, 'dt'),
      figcaption: element(root, 'figcaption'),
      figure: element(root, 'figure'),
      hr: element(root, 'hr'),
      li: element(root, 'li'),
      main: element(root, 'main'),
      ol: element(root, 'ol'),
      p: element(root, 'p'),
      pre: element(root, 'pre'),
      ul: element(root, 'ul'),
      // inline text semantics
      a: element(root, 'a'),
      abbr: element(root, 'abbr'),
      b: element(root, 'b'),
      bdi: element(root, 'bdi'),
      bdo: element(root, 'bdo'),
      br: element(root, 'br'),
      cite: element(root, 'cite'),
      code: element(root, 'code'),
      data: element(root, 'data'),
      dfn: element(root, 'dfn'),
      em: element(root, 'em'),
      i: element(root, 'i'),
      kbd: element(root, 'kbd'),
      mark: element(root, 'mark'),
      q: element(root, 'q'),
      rp: element(root, 'rp'),
      rt: element(root, 'rt'),
      rtc: element(root, 'rtc'),
      ruby: element(root, 'ruby'),
      s: element(root, 's'),
      samp: element(root, 'samp'),
      small: element(root, 'small'),
      span: element(root, 'span'),
      strong: element(root, 'strong'),
      sub: element(root, 'sub'),
      sup: element(root, 'sup'),
      time: element(root, 'time'),
      u: element(root, 'u'),
      var: element(root, 'var'),
      wbr: element(root, 'wbr'),
      // image and multimedia
      area: element(root, 'area'),
      audio: element(root, 'audio'),
      img: element(root, 'img'),
      map: element(root, 'map'),
      track: element(root, 'track'),
      video: element(root, 'video'),
      // embedded content
      embed: element(root, 'embed'),
      iframe: element(root, 'iframe'),
      object: element(root, 'object'),
      param: element(root, 'param'),
      source: element(root, 'source'),
      // scripting
      canvas: element(root, 'canvas'),
      noscript: element(root, 'noscript'),
      script: element(root, 'script'),
      // edits
      del: element(root, 'del'),
      ins: element(root, 'ins'),
      // table content
      caption: element(root, 'caption'),
      col: element(root, 'col'),
      colgroup: element(root, 'colgroup'),
      table: element(root, 'table'),
      tbody: element(root, 'tbody'),
      td: element(root, 'td'),
      tfoot: element(root, 'tfoot'),
      th: element(root, 'th'),
      thead: element(root, 'thead'),
      tr: element(root, 'tr'),
      //forms
      button: element(root, 'button'),
      datalist: element(root, 'datalist'),
      fieldset: element(root, 'fieldset'),
      form: element(root, 'form'),
      input: element(root, 'input'),
      keygen: element(root, 'keygen'),
      label: element(root, 'label'),
      legend: element(root, 'legend'),
      meter: element(root, 'meter'),
      optgroup: element(root, 'optgroup'),
      option: element(root, 'option'),
      output: element(root, 'output'),
      progress: element(root, 'progress'),
      select: element(root, 'select'),
      textarea: element(root, 'textarea'),
      // interactive element
      details: element(root, 'details'),
      dialog: element(root, 'dialog'),
      menu: element(root, 'menu'),
      menuitem: element(root, 'menuitem'),
      summary: element(root, 'summary')
      // web components
      // content
      // element
      // shadow
      // template
    };

    // generic attribute setter
    var attr = compose(chain, function(key, value) {
      getLastChildNodeElementAttributes(root)[key] = value;
      return [root, null];
    });
    // specific attribute setters
    // TODO: may be able to compose with attr
    var id = compose(chain, function(idString) {
      getLastChildNodeElementAttributes(root).id = idString;
      return [root, null];
    });

    var className = compose(chain, function(classNameString) {
      getLastChildNodeElementAttributes(root).className = classNameString;
      return [root, null];
    });

    var text = compose(chain, function(textString) {
      getLastChildNodeElementAttributes(root).textContent = textString;
      return [root, null];
    });

    var dataKey = compose(chain, function(dataKeyString) {
      getLastChildNode(root).dataKey = dataKeyString;
      return [root, null];
    });

    var queryKey = compose(chain, function(queryKeyString) {
      getLastChildNode(root).queryKey = queryKeyString;
      return [root, null];
    });

    return extend({ _component: true }, domElements, {
      attr: attr,
      id: id,
      className: className,
      text: text,
      dataKey: dataKey,
      queryKey: queryKey,
      // children: children,
      end: end,
      render: render
    });
  }

  window.component = component;
  // usage:
  // comp().div().div().children(comp().div().div());
})(window, Array, document);
