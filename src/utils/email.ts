// Global imports
import { createTransport } from 'nodemailer'
import type { SendMailOptions, Transporter } from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { convert } from 'html-to-text'
import type { User } from 'better-auth'

// Local imports
import { env, isDevelopment } from '../config/env'

enum EmailTemplate {
	Welcome = 'welcome',
	PasswordReset = 'passwordReset',
	EmailVerificationCode = 'emailVerificationCode',
	ResetPasswordVerificationCode = 'resetPasswordVerificationCode',
	SignInCode = 'signInCode'
	// Newsletter = 'newsletter'
	// Add more templates here
}

const __dirname = import.meta.dirname

class Email {
	private readonly to: string
	private readonly firstName: string
	private readonly from: string
	private readonly url: string

	constructor(user: Pick<User, 'email'> & Partial<User>, url: string) {
		this.to = user.email
		// If a name isn't provided, create a fallback from the email address
		this.firstName = user.name ? user.name.split(' ')[0] : user.email.split('@')[0]
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
		const templatePath = path.join(__dirname, `../views/${template}.html`)
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
		if (isDevelopment) return
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

	public async SendSignInCode(otp: string): Promise<void> {
		const html = this._renderTemplate(EmailTemplate.SignInCode, {
			firstName: this.firstName,
			otp
		})
		await this._send(html, 'Your Sign In Verification Code')
	}

	public async sendEmailVerificationCode(otp: string): Promise<void> {
		const html = this._renderTemplate(EmailTemplate.EmailVerificationCode, {
			firstName: this.firstName,
			otp
		})
		await this._send(html, 'Your Email Verification Code')
	}

	public async sendResetPasswordVerificationCode(otp: string): Promise<void> {
		const html = this._renderTemplate(EmailTemplate.ResetPasswordVerificationCode, {
			firstName: this.firstName,
			otp
		})
		await this._send(html, 'Your Reset Password Verification Code')
	}

	public async sendWelcome(): Promise<void> {
		const html = this._renderTemplate(EmailTemplate.Welcome, { firstName: this.firstName, url: this.url })
		await this._send(html, 'Welcome to natour!')
	}
}

export default Email
