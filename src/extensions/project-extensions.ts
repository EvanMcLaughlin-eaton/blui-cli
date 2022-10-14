/*
 * This file includes utilities for creating new skeleton projects in any framework using
 * the associated CLIs via npx.
 */
import { GluegunToolbox } from 'gluegun';
import { NPM7_PREFIX, QUESTIONS } from '../constants';
import {
    assignJsTs,
    AngularProps,
    ReactProps,
    ReactNativeProps,
    Template,
    Language,
    getVersionString,
} from '../utilities';

module.exports = (toolbox: GluegunToolbox): void => {
    const { system, parse, print } = toolbox;
    const { options } = toolbox.parameters;

    const createAngularProject = async (): Promise<AngularProps> => {
        const [name, template, lint, prettier]: [string, string, boolean, boolean] = await parse([
            QUESTIONS.name,
            QUESTIONS.template,
            QUESTIONS.lint,
            QUESTIONS.prettier,
        ]);

        const command = `${NPM7_PREFIX} && npx -p @angular/cli@^13.2.6 ng new ${name} --directory "${name}" --style=scss`;
        const spinner = print.spin('Creating a new Angular project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);

        spinner.stop();
        print.info(output);
        print.success(`Created skeleton Angular project in ${timer() / 1000} seconds`);

        return { name, lint, prettier, template };
    };

    const createReactProject = async (): Promise<ReactProps> => {
        let lint = true;
        let language: Language = 'ts';

        // Choose a name & template
        const [name, template]: [string, Template] = await parse([QUESTIONS.name, QUESTIONS.template]);
        const isLocal = template.startsWith('file:');

        // Choose a language
        const [languageTemp]: [string] = await parse([QUESTIONS.language]);
        language = assignJsTs(languageTemp);
        const isTs = language === 'ts';

        // Choose code formatting options
        if (isTs) {
            [lint] = await parse([QUESTIONS.lint]);
        }
        const [prettier]: [boolean] = await parse([QUESTIONS.prettier]);

        // determine the version of the template to use (--alpha, --beta, or explicit --template=name@x.x.x)
        const [templateNameParam, versionString] = getVersionString(options, template);

        // Map the template selection to template name
        let templateName = '';
        switch (templateNameParam.toLocaleLowerCase()) {
            case 'basic routing':
            case 'routing': // to allow for --template=routing instead of --template="basic routing"
                templateName = isTs ? '@brightlayer-ui/routing-typescript' : '@brightlayer-ui/routing';
                break;
            case 'authentication':
                templateName = isTs ? '@brightlayer-ui/authentication-typescript' : '@brightlayer-ui/authentication';
                break;
            case 'blank':
                templateName = isTs ? '@brightlayer-ui/blank-typescript' : '@brightlayer-ui/blank';
                break;
            default:
                // allow users to specify a local file to test
                if (isLocal) {
                    templateName = templateNameParam;
                } else {
                    templateName = isTs ? '@brightlayer-ui/blank-typescript' : '@brightlayer-ui/blank';
                }
        }

        const command = `${NPM7_PREFIX} && npx create-react-app ${name} --template ${templateName}${versionString}`;

        const spinner = print.spin('Creating a new React project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton React project in ${timer() / 1000} seconds`);

        return { name, language, lint, prettier };
    };

    const createReactNativeProject = async (): Promise<ReactNativeProps> => {
        // Choose a name
        const [name]: [string] = await parse([QUESTIONS.name]);

        // Choose a template
        let template = '';
        [template] = await parse([QUESTIONS.template]);

        // Choose a language
        const [languageTemp]: [string] = await parse([QUESTIONS.language]);
        const language = assignJsTs(languageTemp);
        const isTs = language === 'ts';

        // Choose code formatting options
        let lint = true;
        if (isTs) {
            [lint] = await parse([QUESTIONS.lint]);
        }
        const [prettier] = await parse([QUESTIONS.prettier]);

        // Create the basic project
        const command = `${NPM7_PREFIX} && npx react-native init ${name} ${
            isTs ? '--template react-native-template-typescript' : '--template react-native'
        }`;

        const spinner = print.spin('Creating a new React Native project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton React Native project in ${timer() / 1000} seconds`);

        return { name, language, lint, prettier, template };
    };

    toolbox.createProject = {
        angular: createAngularProject,
        react: createReactProject,
        reactNative: createReactNativeProject,
    };
};
