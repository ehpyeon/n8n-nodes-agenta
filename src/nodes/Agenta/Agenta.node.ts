import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class Agenta implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Agenta',
		name: 'agenta',
		icon: 'file:agenta.svg',
		group: ['transform'],
		version: 1,
		description: 'Agenta prompt management and LLM invocation',
		defaults: {
			name: 'Agenta',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'agentaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Fetch Prompt/Config',
						value: 'fetchPromptConfig',
						description: 'Retrieve prompt configurations from Agenta',
						action: 'Fetch prompt configuration',
					},
					{
						name: 'Invoke LLM',
						value: 'invokeLlm',
						description: 'Execute LLM calls through Agenta',
						action: 'Invoke LLM',
					},
				],
				default: 'fetchPromptConfig',
			},
			{
				displayName: 'Environment',
				name: 'environment',
				type: 'options',
				options: [
					{
						name: 'Development',
						value: 'development',
					},
					{
						name: 'Staging',
						value: 'staging',
					},
					{
						name: 'Production',
						value: 'production',
					},
				],
				default: 'development',
				description: 'Environment to use',
				displayOptions: {
					show: {
						operation: ['fetchPromptConfig', 'invokeLlm'],
					},
				},
			},
			{
				displayName: 'Application Slug',
				name: 'applicationSlug',
				type: 'string',
				default: '',
				description: 'Application slug identifier',
				displayOptions: {
					show: {
						operation: ['fetchPromptConfig', 'invokeLlm'],
					},
				},
			},
			{
				displayName: 'Input Variables',
				name: 'inputVariables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Variables to pass to the LLM',
				displayOptions: {
					show: {
						operation: ['invokeLlm'],
					},
				},
				options: [
					{
						name: 'variable',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Variable Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the variable',
								placeholder: 'e.g., text, context, prompt',
							},
							{
								displayName: 'Variable Value',
								name: 'value',
								type: 'string',
								typeOptions: {
									rows: 3,
								},
								default: '',
								description: 'Value of the variable',
								placeholder: 'Enter the value for this variable',
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['fetchPromptConfig'],
					},
				},
				options: [
					{
						displayName: 'Environment Version',
						name: 'environmentVersion',
						type: 'string',
						default: '',
						description: 'Specific version of the environment (optional)',
					},
					{
						displayName: 'Environment ID',
						name: 'environmentId',
						type: 'string',
						default: '',
						description: 'Environment ID (optional)',
					},
					{
						displayName: 'Application Version',
						name: 'applicationVersion',
						type: 'string',
						default: '',
						description: 'Application version (optional)',
					},
					{
						displayName: 'Application ID',
						name: 'applicationId',
						type: 'string',
						default: '',
						description: 'Application ID (optional)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('agentaApi');
				const baseUrl = credentials.baseUrl as string;
				const environment = this.getNodeParameter('environment', i) as string;
				const applicationSlug = this.getNodeParameter('applicationSlug', i) as string;

				if (operation === 'fetchPromptConfig') {
					const options = this.getNodeParameter('options', i, {}) as {
						environmentVersion?: string;
						environmentId?: string;
						applicationVersion?: string;
						applicationId?: string;
					};

					// Validate required fields
					if (!applicationSlug) {
						throw new Error('Application slug is required for fetching prompt config');
					}

					// Build request body
					const requestBody = {
						environment_ref: {
							slug: environment,
							version: options.environmentVersion || null,
							id: options.environmentId || null,
						},
						application_ref: {
							slug: applicationSlug,
							version: options.applicationVersion || null,
							id: options.applicationId || null,
						},
					};

					// Make API request
					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/api/api/variants/configs/fetch`,
						body: requestBody,
						json: true,
						headers: {
							'Content-Type': 'application/json',
						},
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'agentaApi',
						requestOptions,
					);

					returnData.push({
						json: {
							...response,
							operation: 'fetchPromptConfig',
							environment,
							applicationSlug,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'invokeLlm') {
					const inputVariables = this.getNodeParameter('inputVariables', i, {}) as {
						variable?: Array<{ name: string; value: string }>;
					};

					// Validate required fields
					if (!applicationSlug) {
						throw new Error('Application slug is required for invoking LLM');
					}

					// Build inputs object from dynamic variables
					const inputs: Record<string, string> = {};
					if (inputVariables.variable && Array.isArray(inputVariables.variable)) {
						for (const variable of inputVariables.variable) {
							if (variable.name && variable.value !== undefined) {
								inputs[variable.name] = variable.value;
							}
						}
					}

					// Validate that at least one input variable is provided
					if (Object.keys(inputs).length === 0) {
						throw new Error('At least one input variable is required for invoking LLM');
					}

					// Build request body
					const requestBody = {
						inputs,
						environment,
						app: applicationSlug,
					};

					// Make API request
					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/services/completion/run`,
						body: requestBody,
						json: true,
						headers: {
							'Content-Type': 'application/json',
						},
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'agentaApi',
						requestOptions,
					);

					returnData.push({
						json: {
							...response,
							operation: 'invokeLlm',
							environment,
							applicationSlug,
							inputVariables: inputs,
						},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				
				// Log detailed error information
				console.error('🚫 Agenta Error:', {
					error: errorMessage,
					itemIndex: i,
					timestamp: new Date().toISOString(),
				});

				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							error: errorMessage,
							error_code: (error as any)?.code || 'unknown_error',
							timestamp: new Date().toISOString()
						},
						pairedItem: { item: i },
					});
				} else {
					throw new Error(`Agenta operation failed for item ${i}: ${errorMessage}`);
				}
			}
		}

		return [returnData];
	}
}
