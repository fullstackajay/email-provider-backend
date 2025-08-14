// Global imports
import { createTransport } from 'nodemailer'
import type { SendMailOptions, Transporter } from 'nodemailer'
import { type Document } from 'mongoose'
import fs from 'fs'
import path from 'path'
import { convert } from 'html-to-text'

// Local imports
import { env } from '../config/env'

enum EmailTemplate {
	Welcome = 'welcome',
	PasswordReset = 'passwordReset'
	// Newsletter = 'newsletter'
	// Add more templates here
}

export interface IUser extends Document {
	name: string
	email: string
}

class Email {
	private readonly to: string
	private readonly firstName: string
	private readonly from: string
	private readonly url: string

	constructor(user: IUser, url: string) {
		this.to = user.email
		this.firstName = user.name.split(' ')[0]
		this.url = url
		this.from = `Ajay <${env.EMAIL_FROM}>`
	}

	private _transport(): Transporter {
		return createTransport({
			host: env.EMAIL_HOST,
			port: env.EMAIL_PORT,
			secure: env.EMAIL_PORT === 465, // true for port 465, false for other ports
			auth: {
				user: env.EMAIL_USERNAME,
				pass: env.EMAIL_PASSWORD
			}
		})
	}

	private _renderTemplate(template: EmailTemplate, replacements: Record<string, string>): string {
		const templatePath = path.join(__dirname, `../view/${template}.html`)
		if (!fs.existsSync(templatePath)) {
			throw new Error(`Template not found: ${templatePath}`)
		}

		let html = fs.readFileSync(templatePath, 'utf-8')
		for (const [key, value] of Object.entries(replacements)) {
			html = html.replace(new RegExp(`{{${key}}}`, 'g'), value)
		}
		return html
	}

	// Send the actual email
	private async _send(html: string, subject: string): Promise<void> {
		// 1.) Render HTML based on a react template

		// 2.) Define email option
		const mailOptions: SendMailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: convert(html)
		}

		// 3.) create a transport and Send Email
		await this._transport().sendMail(mailOptions)
	}

	public async sendWelcome(): Promise<void> {
		const html = this._renderTemplate(EmailTemplate.Welcome, { firstName: this.firstName, url: this.url })
		await this._send(html, 'Welcome to natour!')
	}

	public async sendPasswordReset(): Promise<void> {
		const html = this._renderTemplate(EmailTemplate.PasswordReset, { firstName: this.firstName, url: this.url })
		await this._send(html, 'Your password reset token (Valid for 10 mints)')
	}
}

export default Email
