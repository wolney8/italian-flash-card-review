'use strict';
const {spawnSync}=require('node:child_process');
const result=spawnSync('python',['scripts/validate_course_library_browser.py','--focus','legacy'],{stdio:'inherit'});if(result.error)throw result.error;process.exit(result.status??1);
