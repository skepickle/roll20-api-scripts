#!/bin/perl -w
use strict;

my %macros;
my @macro_order = ();

## READ INPUT

my $state = "IDLE"; # VALUES = IDLE, RECORDING
my $rec_macro_name = "";
my $rec_macro_text = "";

my $next_state = "IDLE";
while (my $line = <>) {
  #print $line;
  $line =~ s/\r\n\z//;
  if    ($state eq "IDLE")      {
    if   ($line =~ /^---+$/) { $next_state = "IDLE"; }
    else                     { #print "      IDLE -> RECORDING\n";
                               $next_state = "RECORDING";
                               $rec_macro_name = $line;
                               $rec_macro_text = ""; };
  }
  elsif ($state eq "RECORDING") {
    if   ($line =~ /^---+$/) { #print "      RECORDING -> IDLE\n";
                               $next_state = "IDLE";
                               $macros{$rec_macro_name} = $rec_macro_text;
                               push @macro_order, $rec_macro_name;
                               $rec_macro_name = "";
                               $rec_macro_text = ""; }
    else                     { $rec_macro_text .= (($rec_macro_text eq "")?(""):"\n") . $line };
  }
  else                          {
    #print "ERROR: invalid state";
    exit 1;
  };
  $state = $next_state;
};
if ($state eq "RECORDING") {
  $macros{$rec_macro_name} = $rec_macro_text;
  push @macro_order, $rec_macro_name;
  $rec_macro_name = "";
  $rec_macro_text = "";
};
#print "\n### PARSING COMPLETE\n\n";

## ESCAPE MACROS

my %escaped_macros;

foreach my $name ( @macro_order) {
  #print $name . "\n";
  my $macro = $macros{$name};
  $macro =~ s/^ +//;
  $macro =~ s/ +$//;
  $macro =~ s/^&/&amp;/g;
  my $escaped = "";
  my $square_bracket_depth = 0;
  my $at_beginning_of_line = 0;
  for my $i (0..length($macro)-1) {
    my $input_char = substr($macro, $i, 1);
    my $append_chars = $input_char;
    if    ($input_char eq "\n") { $at_beginning_of_line = 1; }
    elsif ($input_char ne " " ) { $at_beginning_of_line = 0; };
    if    ($input_char eq " " ) { if ($at_beginning_of_line) { $append_chars = "&nbsp;" }; }
    elsif ($input_char eq "\@") { if ($square_bracket_depth >= 4) { $append_chars = "&#64;"; }  }
    elsif ($input_char eq "\[") { $square_bracket_depth++; }
    elsif ($input_char eq "\]") { $square_bracket_depth--; }
    else                        {  }
    $escaped .= $append_chars;
  };
  $escaped =~ s/`/&grave;/g;
  $escaped =~ s/\)/&#41;/g;
  $escaped =~ s/}}/}&#125;/g;
  $escaped =~ s/]]/]&#93;/g;
  $escaped =~ s/\*/&#42;/g;
  $escaped =~ s/\?\{/&#63;{/g;
  $escaped =~ s/^\@/&#64;/;
  $escaped =~ s/\\n/\n/g;
  $escaped_macros{$name} = $escaped;
  #print $escaped . "\n\n";
};

#PRINT
print '/w GM &{template:DnD35StdRoll} {{pcflag=true}} {{name=@{selected|character_name}\'s
Special Attacks}} {{notes=';
foreach my $name ( @macro_order) {
  print "[".$name."](!&#13;\n" . $escaped_macros{$name} . " )\n";
};
print "}}";

exit;

my %buttons;



