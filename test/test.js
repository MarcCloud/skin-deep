var chai = require('chai');
var expect = chai.expect;

var React = require('react');

var sd = require('../skin-deep');

var $ = React.createElement;

describe("skin-deep", function() {

  it("should render a ReactElement", function() {
    var tree = sd.shallowRender($('h1', { title: "blah" }, "Heading!"));
    var vdom = tree.getRenderOutput();
    expect(vdom).to.have.property('type', 'h1');
    expect(vdom.props).to.have.property('title', 'blah');
    expect(vdom.props).to.have.property('children', 'Heading!');
  });

  it("should render a React Component", function() {
    var Component = React.createClass({
      render: function() {
        return $('h1', { title: "blah" }, "Heading!");
      }
    });
    var tree = sd.shallowRender($(Component));
    var vdom = tree.getRenderOutput();
    expect(vdom).to.have.property('type', 'h1');
    expect(vdom.props).to.have.property('title', 'blah');
    expect(vdom.props).to.have.property('children', 'Heading!');
  });

  it("should render function returning a ReactElement tree", function() {
    var tree = sd.shallowRender(function() {
      return $('h1', { title: "blah" }, "Heading!");
    });
    var vdom = tree.getRenderOutput();
    expect(vdom).to.have.property('type', 'h1');
    expect(vdom.props).to.have.property('title', 'blah');
    expect(vdom.props).to.have.property('children', 'Heading!');
  });

  it("should render function building a component", function() {
    var Component = React.createClass({
      render: function() {
        return $('h1', { title: "blah" }, "Heading!");
      }
    });
    var tree = sd.shallowRender(function() {
      return $(Component);
    });
    var vdom = tree.getRenderOutput();
    expect(vdom).to.have.property('type', 'h1');
    expect(vdom.props).to.have.property('title', 'blah');
    expect(vdom.props).to.have.property('children', 'Heading!');
  });

  it("should render components with context using function", function() {
    var Component = React.createClass({
      contextTypes: { title: React.PropTypes.string },
      render: function() {
        return $('h1', { title: "blah" }, this.context.title);
      }
    });
    var tree = sd.shallowRender(function() {
      return $(Component);
    }, { title: "Heading!" });
    var vdom = tree.getRenderOutput();
    expect(vdom).to.have.property('type', 'h1');
    expect(vdom.props).to.have.property('title', 'blah');
    expect(vdom.props).to.have.property('children', 'Heading!');
  });

  describe("findNode", function() {
    var Widget = React.createClass({
      displayName: 'Widget',
      render: function() { return 'widget'; }
    });
    var tree = sd.shallowRender(
      $('div', {},
        $('div', {}, 'objection!'),
        $('div', {id: "def"}, "DEF"),
        $('div', {},
          $('div', {}, "objection!"),
          $('object', {}, "objection!"),
          'hello',
          [$('div', {className: "abc", key: "1"}, "ABC")],
          $(Widget, {})
        )
      )
    );

    it("should find a node in tree by className", function() {
      var abc = tree.findNode(".abc");
      expect(abc).to.have.property('type', 'div');
      expect(abc.props).to.have.property('children', 'ABC');
    });

    it("should find a node in tree by id", function() {
      var abc = tree.findNode("#def");
      expect(abc).to.have.property('type', 'div');
      expect(abc.props).to.have.property('children', 'DEF');
    });

    it("should find a node in tree by tagname", function() {
      var abc = tree.findNode("object");
      expect(abc).to.have.property('type', 'object');
      expect(abc.props).to.have.property('children', 'objection!');
    });

    it("should find a node in tree by component displayName", function() {
      var abc = tree.findNode("Widget");
      expect(abc).to.have.property('type', Widget);
    });

    it("should return false when node not found", function() {
      expect(tree.findNode(".def")).to.eql(false);
      expect(tree.findNode("#abc")).to.eql(false);
    });

    it("should throw on invalid selector", function() {
      expect(function() {
        tree.findNode(";huh?");
      }).to.throw(/invalid/i);
    });
  });

  describe("textIn", function() {
    var tree = sd.shallowRender(
      $('div', {},
        $('div', {className: "abc"}, "ABC"),
        $('div', {id: "def"}, "DEF"),
        $('object', {}, "objection!")
      )
    );
    it("should grab text in selector", function() {
      expect(tree.textIn(".abc")).to.eql("ABC");
      expect(tree.textIn("#def")).to.eql("DEF");
      expect(tree.textIn("object")).to.eql("objection!");
    });
  });

  describe("fillField", function() {
    var tree;
    var Component = React.createClass({
      getInitialState: function() {
        return { "username": "" };
      },
      getNickname: function() {
        return React.findDOMNode(this.refs.nickname).value;
      },
      render: function() {
        return $('form', {},
          $('input', {
            type: "text", id: "username",
            value: this.state.username, onChange: function(event) {
              this.setState({"username": event.target.value});
            }.bind(this)
          }),
          $('input', {
            type: "text", ref: "nickname", className: "nickname"
          })
        );
      }
    });
    beforeEach(function() {
      tree = sd.shallowRender($(Component));
    });

    it("should set value of controlled text field", function() {
      expect(tree.findNode("#username").props)
        .to.have.property("value", "");

      tree.fillField("#username", "glenjamin");

      expect(tree.findNode("#username").props)
        .to.have.property("value", "glenjamin");
    });

    it("should no-op on field without change handler", function() {
      var before = tree.findNode(".nickname");

      tree.fillField(".nickname", "glenjamin");

      expect(tree.findNode(".nickname")).to.eql(before);
    });

    it.skip("should set value of uncontrolled text field", function() {
      // Can this be done?
    });

    it("should throw if field not found", function() {
      expect(function() {
        tree.fillField("#losername", "not-glenjamin");
      }).to.throw(/unknown/i);
    });
  });

  describe("toString", function() {
    it("should give HTML", function() {
      var tree = sd.shallowRender($('h1', { title: "blah" }, "Heading!"));
      expect('' + tree).to.eql('<h1 title="blah">Heading!</h1>');
    });
  });

  describe("text", function() {
    var Widget = React.createClass({
      displayName: 'Widget',
      render: function() { return 'Should not see'; }
    });
    it("should give a textual representation of the tree", function() {
      var tree = sd.shallowRender($('h1', { title: "blah" },
        "Heading!",
        $('div', { title: "blah" },
          123, $('hr'),
          'Some text.',
          'More text.',
          [ React.createElement(Widget, { key: 1 }),
            React.createElement(Widget, { key: 2 }) ])
      ));
      expect(tree.text())
        .to.eql('Heading! 123 Some text. More text. <Widget /> <Widget />');
    });
    it("Should render a single zero child correctly", function() {
      var tree = sd.shallowRender($('h1', {}, 0));
      expect(tree.text()).to.eql('0');
    });
  });

  describe("subTree", function() {
    var subTree;
    var tree = sd.shallowRender(
      $('div', {},
        $('div', {id: "def", className: "abc"},
          "DEF", $('hr')),
        $('div', {id: "abc"},
          $('div', {}, "objection!"),
          $('object', {}, "objection!"),
          'hello',
          [$('div', {id: "abc2", className: "abc", key: "1"}, "ABC")]
        )
      )
    );
    it("should grab a subtree by id selector", function() {
      var abc = tree.subTree("#abc");
      expect(abc).to.be.an('object');
      expect(abc.getRenderOutput().props).to.have.property("id", "abc");
    });
    it("should grab a subtree by class selector", function() {
      var abc = tree.subTree(".abc");
      expect(abc).to.be.an('object');
      expect(abc.getRenderOutput().props).to.have.property("className", "abc");
    });
    it("should grab a subtree by tag selector", function() {
      var abc = tree.subTree("object");
      expect(abc).to.be.an('object');
      expect(abc.getRenderOutput().props)
        .to.have.property("children", "objection!");
    });
    describe("methods", function() {
      beforeEach(function() {
        subTree = tree.subTree('#abc');
      });
      it("should have same methods as main tree", function() {
        expect(Object.keys(tree)).to.eql(Object.keys(subTree));
      });
      it("should provide scoped findNode()", function() {
        expect(subTree.findNode(".abc")).to.eql(tree.findNode("#abc2"));
      });
      it("should provide scoped textIn()", function() {
        expect(subTree.textIn(".abc")).to.eql("ABC");
      });
      it("should provide scoped text()", function() {
        expect(subTree.text()).to.eql("objection! objection! hello ABC");
      });
    });
  });
});
