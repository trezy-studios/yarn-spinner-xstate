// Module imports
import { expect } from 'chai'
import { Parser as BBCodeParser } from 'bbcode-ast'





// Local imports
import { Markup } from '../../src/structures/Markup.js'
import { parseDialogLine } from '../../src/index.js'
import { Tag } from '../../src/structures/Tag.js'





// Constants
const BBCODE_PARSER = new BBCodeParser(
	[
		'bold',
		'italic',
	],
	false,
	true,
)





describe('parseDialogLine', function() {
	it('parses a line of dialog', function() {
		const author = 'Bob Borgenstein'
		const body = 'Why hello there! Nice day, isn\'t it?'

		const parsedDialogLine = parseDialogLine(`${author}: ${body}`, {
			bbcodeParser: BBCODE_PARSER,
			context: {},
			validMarkup: [],
		})

		expect(parsedDialogLine).to.have.own.property('ast')
		expect(parsedDialogLine.author).to.equal(author)
		expect(parsedDialogLine.body).to.equal(body)
		expect(parsedDialogLine.markup).to.deep.equal([])
		expect(parsedDialogLine.tags).to.deep.equal([])
	})

	it('parses a line of dialog without an author', function() {
		const body = 'Why hello there! Nice day, isn\'t it?'

		const parsedDialogLine = parseDialogLine(body, {
			bbcodeParser: BBCODE_PARSER,
			context: {},
			validMarkup: [],
		})

		expect(parsedDialogLine).to.have.own.property('ast')
		expect(parsedDialogLine.author).to.be.undefined
		expect(parsedDialogLine.body).to.equal(body)
		expect(parsedDialogLine.markup).to.deep.equal([])
		expect(parsedDialogLine.tags).to.deep.equal([])
	})

	it('parses a line of dialog with markup', function() {
		const author = 'Bob Borgenstein'
		const body = 'Why hello there! [bold]Nice[/bold] day, isn\'t it?'
		const bodyWithoutMarkup = 'Why hello there! Nice day, isn\'t it?'

		const parsedDialogLine = parseDialogLine(`${author}: ${body}`, {
			bbcodeParser: BBCODE_PARSER,
			context: {},
			validMarkup: ['bold'],
		})

		expect(parsedDialogLine).to.have.own.property('ast')
		expect(parsedDialogLine.author).to.equal(author)
		expect(parsedDialogLine.body).to.equal(bodyWithoutMarkup)
		expect(parsedDialogLine.tags).to.deep.equal([])

		parsedDialogLine.markup.forEach(markup => {
			expect(markup).to.be.instanceOf(Markup)
		})

		expect(parsedDialogLine.markup[0]).to.be.instanceOf(Markup)
		expect(parsedDialogLine.markup[0].length).to.equal(4)
		expect(parsedDialogLine.markup[0].position).to.equal(17)
		expect(parsedDialogLine.markup[0].type).to.equal('bold')
	})

	it('parses a line of dialog with multiple markup instances', function() {
		const author = 'Bob Borgenstein'
		const body = 'Why hello there! [bold]Nice[/bold] [italic]day[/italic], isn\'t it?'
		const bodyWithoutMarkup = 'Why hello there! Nice day, isn\'t it?'

		const parsedDialogLine = parseDialogLine(`${author}: ${body}`, {
			bbcodeParser: BBCODE_PARSER,
			context: {},
			validMarkup: [
				'bold',
				'italic',
			],
		})

		expect(parsedDialogLine).to.have.own.property('ast')
		expect(parsedDialogLine.author).to.equal(author)
		expect(parsedDialogLine.body).to.equal(bodyWithoutMarkup)
		expect(parsedDialogLine.tags).to.deep.equal([])

		parsedDialogLine.markup.forEach(markup => {
			expect(markup).to.be.instanceOf(Markup)
		})

		expect(parsedDialogLine.markup[0]).to.be.instanceOf(Markup)
		expect(parsedDialogLine.markup[0].length).to.equal(4)
		expect(parsedDialogLine.markup[0].position).to.equal(17)
		expect(parsedDialogLine.markup[0].type).to.equal('bold')

		expect(parsedDialogLine.markup[1]).to.be.instanceOf(Markup)
		expect(parsedDialogLine.markup[1].length).to.equal(3)
		expect(parsedDialogLine.markup[1].position).to.equal(22)
		expect(parsedDialogLine.markup[1].type).to.equal('italic')
	})

	it('parses a line of dialog with tags', function() {
		const author = 'Bob Borgenstein'
		const body = 'Why hello there! Nice day, isn\'t it?'
		const tags = [
			{
				key: 'duplicate',
				value: undefined,
			},
			{
				key: 'tone',
				value: 'sarcastic',
			},
		]

		tags.forEach(tag => {
			tag.original = `#${[tag.key]}`

			if (tag.value) {
				tag.original += `:${tag.value}`
			}
		})

		const serialisedTags = tags
			.map(tag => tag.original)
			.join(' ')

		const parsedDialogLine = parseDialogLine(`${author}: ${body} ${serialisedTags}`, {
			bbcodeParser: BBCODE_PARSER,
			context: {},
			validMarkup: [],
		})

		expect(parsedDialogLine).to.have.own.property('ast')
		expect(parsedDialogLine.author).to.equal(author)
		expect(parsedDialogLine.body).to.equal(body)
		expect(parsedDialogLine.markup).to.deep.equal([])

		parsedDialogLine.tags.forEach(tag => {
			expect(tag).to.be.instanceOf(Tag)
		})
	})
})
