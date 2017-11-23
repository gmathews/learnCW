class CharacterMap{
    constructor(){
        this.searchTree = {
            // Start with dot
            1: { res: 'E',
                1: { res: 'I',
                    1: { res: 'S',
                        1: { res: 'H',
                            1: { res: '5' },
                            3: { res: '4' }
                        },
                        3: { res: 'V',
                            1: { res: '&nbsp;' }, // Foreign
                            3: { res: '3' }
                        }
                    },
                    3: { res: 'U',
                        1: { res: 'F' },
                        3: { res: '&nbsp;', // Foreign
                            1: { res: '&nbsp;', // Foreign
                                1: { res: '?' },
                                3: { res: '_' },
                            },
                            3: { res: '2' }
                        }
                    }
                },
                3: { res: 'A',
                    1: { res: 'R',
                        1: { res: 'L',
                            3: { res: '&nbsp;', // Foreign
                                1: { res: '"' }
                            }
                        },
                        3: { res: '&nbsp;', // Foreign
                            1: { res: '+',
                                3: { res: '.' }
                            }
                        }
                    },
                    3: { res: 'W',
                        1: { res: 'P',
                            3: { res: '&nbsp;', // Foreign
                                1: { res: '@' }
                            }
                        },
                        3: { res: 'J',
                            3: { res: '1',
                            1: { res: "'" }
                            }
                        }
                    }
                }
            },

            // Start with dash
            3: { res: 'T',
                1: { res: 'N',
                    1: { res: 'D',
                        1: { res: 'B',
                            1: { res: '6',
                                3: { res: '-' }
                            },
                            3: { res: '=' }
                        },
                        3: { res: 'X',
                            1: { res: '/' }
                        }
                    },
                    3: { res: 'K',
                        1: { res: 'C',
                            3: { res: '&nbsp;', // None
                                1: { res: ';' },
                                3: { res: '!' }
                            }
                        },
                        3: { res: 'Y',
                            1: { res: '&nbsp;', // Foreign
                                3: { res: '()' }
                            }
                        }
                    }
                },
                3: { res: 'M',
                    1: { res: 'G',
                        1: { res: 'Z',
                            1: { res: '7' },
                            3: { res: '&nbsp;', // None
                                3: { res: ',' }
                            }
                        },
                        3: { res: 'Q' }
                    },
                    3: { res: 'O',
                        1: { res: '&nbsp;', //Foreign
                            1: { res: '8',
                                1: { res: ':' }
                            }
                        },
                        3: { res: '&nbsp;', //Foreign
                            1: { res: '9' },
                            3: { res: '0' }
                        }
                    }
                }
            }
        };
    }

    // 1 for dot and 3 for dash to lookup in the search table
    currentChar( elements, item=this.searchTree ){
        if( elements.length < 1 ){
            return '';
        }
        console.log( elements );
        if( elements.length === 1 ){
            return item[ elements[0] ].res
        }else{
            return this.currentChar( elements.slice( 1 ), item[ elements[0] ] );
        }
    }


}
